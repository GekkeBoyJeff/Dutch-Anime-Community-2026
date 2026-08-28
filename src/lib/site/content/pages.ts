import 'server-only';
import { z } from 'zod';

import { pages as rawPages } from '@/content/pages';
import { notFoundPage as rawNotFound } from '@/content/pages/notFound';
import { env } from '@/lib/shared/env';
import { getAdminClient } from '@/lib/shared/supabase/admin';
import { Page } from '@/lib/site/content/schema';
import { parseContent } from '@/lib/site/content/validate';

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
