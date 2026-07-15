import type { MetadataRoute } from 'next';

import { getAllPagePaths } from '@/lib/content';
import { routes } from '@/lib/site';

// Content-derived and static; marking it static lets `output: export` emit a plain file.
export const dynamic = 'force-static';

// Next builds /sitemap.xml from this. It draws from the same content layer as the pages, so the
// sitemap stays in sync with what actually exists. One content type now → one branch.
const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
	const paths = await getAllPagePaths();

	return paths.map((path) => ({
		url: routes.absolute(path),
		changeFrequency: 'monthly' as const,
		priority: path === routes.home ? 1 : 0.8,
	}));
};

export default sitemap;
