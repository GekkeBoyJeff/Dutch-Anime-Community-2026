import 'server-only';
import { z } from 'zod';

import { pages as rawPages } from '@/content/pages';
import { notFoundPage as rawNotFound } from '@/content/pages/notFound';
import { structures as rawStructures } from '@/content/structures';
import { env } from '@/lib/shared/env';
import { getAdminClient } from '@/lib/shared/supabase/admin';
import { Page, SiteStructures } from '@/lib/site/content/document';

interface ContentErrorOptions {
	label: string;
	locate: (path: readonly PropertyKey[]) => { source: string; field: string };
}

// Content that no longer matches the schema stops the build with the page and the field that broke,
// instead of a Zod dump nobody can trace back to a file.
const parseContent = <Schema extends z.ZodType>(
	schema: Schema,
	raw: unknown,
	{ label, locate }: ContentErrorOptions,
): z.infer<Schema> => {
	const result = schema.safeParse(raw);
	if (result.success) return result.data;

	const bySource = new Map<string, string[]>();
	for (const issue of result.error.issues) {
		const { source, field } = locate(issue.path);
		const entry = `   └ ${field || '(root)'}\n     ${issue.message}`;
		bySource.set(source, [...(bySource.get(source) ?? []), entry]);
	}

	const report = [...bySource.entries()]
		.map(([source, entries]) => `  ${source}\n${entries.join('\n')}`)
		.join('\n\n');
	const count = result.error.issues.length;

	throw new Error(`✖ Invalid ${label} — ${count} problem${count === 1 ? '' : 's'}:\n\n${report}\n`);
};

// Unset, CONTENT_SOURCE infers Supabase from SUPABASE_SERVICE_ROLE_KEY so existing deploys keep
// working; 'registry' serves src/content with the key still in place, to preview unpublished work.
export const dbEnabled = () =>
	env.CONTENT_SOURCE ? env.CONTENT_SOURCE === 'supabase' : Boolean(env.SUPABASE_SERVICE_ROLE_KEY);

// The live build reads `published_data` (CONTENT_CHANNEL=published); staging and local read `data`.
export const contentColumn = () => (env.CONTENT_CHANNEL === 'published' ? 'published_data' : 'data');

const staticPages = parseContent(z.record(z.string(), Page), rawPages, {
	label: 'page content',
	locate: (path) => {
		const [route, ...rest] = path;
		return { source: `page "${String(route)}"`, field: rest.join('.') };
	},
});
const staticNotFound = parseContent(Page, rawNotFound, {
	label: '404 content',
	locate: (path) => ({ source: 'notFound page', field: path.join('.') }),
});
const staticStructures = parseContent(SiteStructures, rawStructures, {
	label: 'site structures',
	locate: (path) => ({ source: 'site structures', field: path.join('.') }),
});

export const getPageByPath = async (path: string): Promise<Page | null> => {
	if (!dbEnabled()) return staticPages[path] ?? null;
	const column = contentColumn();
	const { data, error } = await getAdminClient().from('pages').select(column).eq('path', path).maybeSingle();
	if (error || !data) return null;
	// The row type is a union keyed by the selected column; `column` isn't a literal to either side of it.
	const content = (data as Record<'data' | 'published_data', unknown>)[column];
	// Empty channel = not published, a genuine 404. Content that IS there but no longer matches the
	// schema is drift: throw, or a renamed block type silently 404s a route getAllPagePaths still lists.
	if (content === null || content === undefined) return null;
	return parseContent(Page, content, {
		label: `page content for "${path}"`,
		locate: (issuePath) => ({ source: path, field: issuePath.join('.') }),
	});
};

export const getAllPagePaths = async (): Promise<string[]> => {
	if (!dbEnabled()) return Object.keys(staticPages);
	let query = getAdminClient().from('pages').select('path');
	if (env.CONTENT_CHANNEL === 'published') query = query.not('published_data', 'is', null);
	const { data, error } = await query;
	// Fail the build rather than silently deploy an empty site if the DB read errors.
	if (error) throw new Error(`getAllPagePaths: Supabase error — ${error.message}`);
	return (data ?? []).map((row) => row.path as string).filter((p) => p !== '/404');
};

export const getNotFoundPage = async (): Promise<Page> => {
	if (!dbEnabled()) return staticNotFound;
	const column = contentColumn();
	const { data } = await getAdminClient().from('pages').select(column).eq('path', '/404').maybeSingle();
	const content = data ? (data as Record<'data' | 'published_data', unknown>)[column] : null;
	if (content === null || content === undefined) return staticNotFound;
	return parseContent(Page, content, {
		label: '404 content',
		locate: (issuePath) => ({ source: 'notFound page', field: issuePath.join('.') }),
	});
};

export const getSiteStructures = async (): Promise<SiteStructures> => {
	if (!dbEnabled()) return staticStructures;
	const column = contentColumn();
	const { data } = await getAdminClient().from('structures').select(column).eq('id', 1).maybeSingle();
	// The row type is a union keyed by the selected column; `column` isn't a literal to either side of it.
	const content = data ? (data as Record<'data' | 'published_data', unknown>)[column] : null;
	// No content falls back to the registry; drifted content throws instead of silently serving the fallback.
	if (content === null || content === undefined) return staticStructures;
	return parseContent(SiteStructures, content, {
		label: 'site structures',
		locate: (path) => ({ source: 'site structures', field: path.join('.') }),
	});
};
