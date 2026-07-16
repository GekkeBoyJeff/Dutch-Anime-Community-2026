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
	const { data, error } = await getAdminClient().from('pages').select('data').eq('path', path).maybeSingle();
	if (error || !data) return null;
	const parsed = Page.safeParse(data.data);
	return parsed.success ? parsed.data : null; // invalid rows never reach the build
};

export const getAllPagePaths = async (): Promise<string[]> => {
	if (!dbEnabled()) return Object.keys(staticPages);
	const { data, error } = await getAdminClient().from('pages').select('path');
	// Fail the build rather than silently deploy an empty site if the DB read errors.
	if (error) throw new Error(`getAllPagePaths: Supabase error — ${error.message}`);
	return (data ?? []).map((row) => row.path as string).filter((p) => p !== '/404');
};

export const getNotFoundPage = async (): Promise<Page> => {
	if (!dbEnabled()) return staticNotFound;
	const { data } = await getAdminClient().from('pages').select('data').eq('path', '/404').maybeSingle();
	const parsed = data ? Page.safeParse(data.data) : undefined;
	return parsed?.success ? parsed.data : staticNotFound; // always return something renderable
};
