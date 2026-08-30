import type { MetadataRoute } from 'next';

import { getAllPagePaths } from '@/lib/site/content';
import { routes } from '@/lib/site/site';

export const dynamic = 'force-static';

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
	const paths = await getAllPagePaths();

	return paths.map((path) => ({
		url: routes.absolute(path),
		changeFrequency: 'monthly' as const,
		priority: path === routes.home ? 1 : 0.8,
	}));
};

export default sitemap;
