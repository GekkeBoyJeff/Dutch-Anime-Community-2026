import 'server-only';
import { z } from 'zod';

import { pages as rawPages } from '@/content/pages';
import { notFoundPage as rawNotFound } from '@/content/pages/notFound';
import { Page } from '@/lib/content/schema';
import { parseContent } from '@/lib/content/validate';

// Validate the whole registry once at module load. A bad shape or value fails the build
// (and shows in the dev error-overlay) pointing at the page route + field that's wrong.
const pages = parseContent(z.record(z.string(), Page), rawPages, {
	label: 'page content',
	locate: (path) => {
		const [route, ...rest] = path;
		return { source: `page "${String(route)}"`, field: rest.join('.') };
	},
});

// The 404 content, validated like the pages but kept out of `pages` so it never becomes a route or a
// sitemap entry. not-found.tsx renders it through the same <Blocks> pipeline as a normal page.
const notFoundPage = parseContent(Page, rawNotFound, {
	label: '404 content',
	locate: (path) => ({ source: 'notFound page', field: path.join('.') }),
});

// Async so the public API survives a future CMS swap unchanged.
export const getPageByPath = async (path: string): Promise<Page | null> => {
	return pages[path] ?? null;
};

export const getAllPagePaths = async (): Promise<string[]> => {
	return Object.keys(pages);
};

// The 404 page content for not-found.tsx. Separate from getPageByPath because it is not a routable page.
export const getNotFoundPage = async (): Promise<Page> => {
	return notFoundPage;
};
