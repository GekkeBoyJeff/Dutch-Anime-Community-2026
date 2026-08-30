import type { Data, DefaultComponents } from '@puckeditor/core';

import { Page, SiteStructures, type StructuredDataNode } from '@/lib/site/content/schema';

// A type alias, not an interface: only an alias satisfies Puck's DefaultComponentProps
// index-signature bound.
export type BuilderRootProps = {
	title?: string;
	description?: string;
	image?: Page['meta']['image'];
	// meta.structuredData, edited as pretty-printed JSON text rather than as nodes.
	structuredData?: string;
	announcementBar?: SiteStructures['announcementBar'];
	navigation?: SiteStructures['navigation'];
	footer?: SiteStructures['footer'];
};

export type BuilderData = Data<DefaultComponents, BuilderRootProps>;

export interface BuilderExport {
	page?: Page;
	structures?: SiteStructures;
	issues: string[];
}

const clean = (value: unknown): unknown => {
	if (typeof value === 'string') {
		return value === '' ? undefined : value;
	}
	if (Array.isArray(value)) {
		return value.map(clean).filter((item) => item !== undefined);
	}
	if (value && typeof value === 'object') {
		const entries = Object.entries(value)
			.map(([key, sub]) => [key, clean(sub)] as const)
			.filter(([, sub]) => sub !== undefined);
		return entries.length ? Object.fromEntries(entries) : undefined;
	}
	return value;
};

export const toPuckData = (page: Page | null, structures: SiteStructures): BuilderData => {
	return {
		root: {
			props: {
				title: page?.meta.title ?? '',
				description: page?.meta.description ?? '',
				image: page?.meta.image,
				structuredData: page?.meta.structuredData ? JSON.stringify(page.meta.structuredData, null, 2) : '',
				announcementBar: structures.announcementBar,
				navigation: structures.navigation,
				footer: structures.footer,
			} satisfies BuilderRootProps,
		},
		content: (page?.blocks ?? []).map((block) => {
			const { type, id, ...props } = block;
			// Puck identifies items by props.id, a string; imported blocks may not carry one.
			return { type, props: { ...props, id: id !== undefined ? String(id) : `${type}-${crypto.randomUUID()}` } };
		}),
	};
};

const zodIssues = (prefix: string, error: { issues: { path: PropertyKey[]; message: string }[] }): string[] => {
	return error.issues.map((issue) => `${prefix}${issue.path.join('.') || '(root)'} — ${issue.message}`);
};

export const fromPuckData = (data: BuilderData): BuilderExport => {
	const root = (data.root.props ?? {}) as BuilderRootProps;
	const issues: string[] = [];

	let structuredData: StructuredDataNode[] | undefined;
	const rawJson = root.structuredData?.trim();
	if (rawJson) {
		try {
			const parsed: unknown = JSON.parse(rawJson);
			structuredData = (Array.isArray(parsed) ? parsed : [parsed]) as StructuredDataNode[];
		} catch {
			issues.push('meta.structuredData — geen geldige JSON');
		}
	}

	const rawPage = clean({
		meta: { title: root.title, description: root.description, image: root.image, structuredData },
		blocks: data.content.map(({ type, props }) => ({ type, ...props })),
	});
	const pageResult = Page.safeParse(rawPage);
	if (!pageResult.success) {
		issues.push(...zodIssues('pagina: ', pageResult.error));
	}

	const rawStructures = clean({
		announcementBar: root.announcementBar?.message ? root.announcementBar : undefined,
		navigation: root.navigation ?? {},
		footer: root.footer ?? {},
	});
	const structuresResult = SiteStructures.safeParse(rawStructures);
	if (!structuresResult.success) {
		issues.push(...zodIssues('structures: ', structuresResult.error));
	}

	return {
		page: pageResult.success ? pageResult.data : undefined,
		structures: structuresResult.success ? structuresResult.data : undefined,
		issues,
	};
};

const stableStringify = (value: unknown): string => {
	if (Array.isArray(value)) {
		return `[${value.map(stableStringify).join(',')}]`;
	}
	if (value && typeof value === 'object') {
		const entries = Object.entries(value)
			.filter(([, sub]) => sub !== undefined)
			.sort(([a], [b]) => a.localeCompare(b))
			.map(([key, sub]) => `${JSON.stringify(key)}:${stableStringify(sub)}`);
		return `{${entries.join(',')}}`;
	}
	return JSON.stringify(value) ?? 'null';
};

export const structuresChanged = (a: SiteStructures, b: SiteStructures): boolean => {
	return stableStringify(clean(a)) !== stableStringify(clean(b));
};
