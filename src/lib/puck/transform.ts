import type { Data, DefaultComponents } from '@puckeditor/core';

import { Page, SiteStructures, type StructuredDataNode } from '@/lib/content/schema';

// Round-trip between the content contract and Puck's data shape. Import: flat {type, id?, ...props}
// → {type, props: {id, ...props}}. Export: back again, then through safeParse — the builder can
// never emit content the build would reject.

/** Root props carried by the editor: page meta plus the site structures. */
// A type alias (not an interface) so it satisfies Puck's DefaultComponentProps index-signature bound.
export type BuilderRootProps = {
	title?: string;
	description?: string;
	image?: Page['meta']['image'];
	/** meta.structuredData edited as pretty-printed JSON text */
	structuredData?: string;
	announcementBar?: SiteStructures['announcementBar'];
	navigation?: SiteStructures['navigation'];
	footer?: SiteStructures['footer'];
};

/** Puck's Data shape with the builder's typed root props. */
export type BuilderData = Data<DefaultComponents, BuilderRootProps>;

export interface BuilderExport {
	/** The validated page, present only when the page data parsed cleanly */
	page?: Page;
	/** The validated structures, present only when the chrome data parsed cleanly */
	structures?: SiteStructures;
	/** Human-readable validation problems (path — message), empty on success */
	issues: string[];
}

/** Normalises editor output back to schema-clean data: '' → undefined, empty objects pruned. */
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
			// Puck identifies items by props.id (a string); give imported blocks one when they lack it.
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

/** JSON.stringify with recursively sorted keys, so key order never causes a false "changed". */
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

/** Deterministic change check so the export modal only shows the structures file when needed. */
export const structuresChanged = (a: SiteStructures, b: SiteStructures): boolean => {
	return stableStringify(clean(a)) !== stableStringify(clean(b));
};

/** '/' → 'homePage', '/over-ons' → 'overOnsPage' — matches the hand-written naming convention. */
const pageExportName = (path: string): string => {
	if (path === '/' || path === '') {
		return 'homePage';
	}
	const camel = path
		.replace(/^\//, '')
		.split(/[/-]/)
		.filter(Boolean)
		.map((part, index) => (index === 0 ? part : part.charAt(0).toUpperCase() + part.slice(1)))
		.join('');
	return `${camel}Page`;
};

/** '/' → 'home', '/over-ons' → 'over-ons' — the src/content/pages/<name>.ts file name. Lives here
 * so every naming rule for exported modules sits next to the code generation that uses it. */
export const pageFileName = (path: string): string => {
	return path === '/' || path === '' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
};

const IDENTIFIER = /^[A-Za-z_$][\w$]*$/;

/** Serialises a value as repo-style TypeScript: unquoted keys, single quotes, tab indent. */
const tsLiteral = (value: unknown, depth: number): string => {
	const indent = '\t'.repeat(depth);
	const child = '\t'.repeat(depth + 1);

	if (typeof value === 'string') {
		return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
	}
	if (Array.isArray(value)) {
		if (!value.length) {
			return '[]';
		}
		return `[\n${value.map((item) => `${child}${tsLiteral(item, depth + 1)},`).join('\n')}\n${indent}]`;
	}
	if (value && typeof value === 'object') {
		const entries = Object.entries(value).filter(([, sub]) => sub !== undefined);
		if (!entries.length) {
			return '{}';
		}
		const lines = entries.map(([key, sub]) => {
			const safeKey = IDENTIFIER.test(key) ? key : `'${key}'`;
			return `${child}${safeKey}: ${tsLiteral(sub, depth + 1)},`;
		});
		return `{\n${lines.join('\n')}\n${indent}}`;
	}
	return String(value);
};

export const pageModuleCode = (page: Page, path: string): string => {
	// Zod's parse output follows schema key order (type/id last); hand-written pages lead with them.
	const ordered = {
		meta: page.meta,
		blocks: page.blocks.map(({ type, id, ...rest }) => ({ type, ...(id !== undefined ? { id } : {}), ...rest })),
	};

	return [
		"import type { Page } from '@/lib/content';",
		'',
		'// Generated by the visual builder (/builder) — the same shape you would write by hand.',
		`export const ${pageExportName(path)}: Page = ${tsLiteral(ordered, 0)};`,
		'',
	].join('\n');
};

export const structuresModuleCode = (structures: SiteStructures): string => {
	return [
		"import type { SiteStructures } from '@/lib/content';",
		'',
		'// Pure data for the site-wide chrome. Generated by the visual builder (/builder).',
		`export const structures: SiteStructures = ${tsLiteral(structures, 0)};`,
		'',
	].join('\n');
};
