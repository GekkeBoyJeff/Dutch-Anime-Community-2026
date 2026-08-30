import type { MetadataRoute } from 'next';

import { site } from '@/lib/site/site';

export const dynamic = 'force-static';

const robots = (): MetadataRoute.Robots => {
	return {
		rules: {
			userAgent: '*',
			allow: '/',
		},
		sitemap: `${site.url}/sitemap.xml`,
	};
};

export default robots;
