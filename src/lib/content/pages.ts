import 'server-only';
import { z } from 'zod';

import { pages as rawPages } from '@/content/pages';
import { notFoundPage as rawNotFound } from '@/content/pages/notFound';
import { Page } from '@/lib/content/schema';
import { parseContent } from '@/lib/content/validate';
import { env } from '@/lib/env';
import { getAdminClient } from '@/lib/supabase/admin';

// Content accessors. When SUPABASE_SERVICE_ROLE_KEY is set (CI build / a local build with the key),
// pages come from Supabase; otherwise they fall back to the validated static registry so a plain
// `next dev` (no key) still runs. The service-role client bypasses RLS — reads are unrestricted.
const dbEnabled = () => Boolean(env.SUPABASE_SERVICE_ROLE_KEY);

// Which column carries the content for the current build: the live build reads `published_data`
// (CONTENT_CHANNEL=published), staging and local builds read the draft `data` column.
const contentColumn = () => (env.CONTENT_CHANNEL === 'published' ? 'published_data' : 'data');

// Validated static registry — the local-dev fallback. Validated once at module load: a bad shape or
// value fails the build (and shows in the dev overlay) pointing at the page route + field.
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
	const parsed = Page.safeParse((data as Record<'data' | 'published_data', unknown>)[column]);
	return parsed.success ? parsed.data : null; // invalid rows never reach the build (or unpublished, on the published channel)
};

export const getAllPagePaths = async (): Promise<string[]> => {
	if (!dbEnabled()) return Object.keys(staticPages);
	let query = getAdminClient().from('pages').select('path');
	// Published channel only lists pages that actually have a published version.
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
	const parsed = data ? Page.safeParse((data as Record<'data' | 'published_data', unknown>)[column]) : undefined;
	return parsed?.success ? parsed.data : staticNotFound; // always return something renderable
};
