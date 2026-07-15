import type { MetadataRoute } from 'next';

import { site } from '@/lib/site';

// Content-derived and static; marking it static lets `output: export` emit a plain file.
export const dynamic = 'force-static';

// Next builds /robots.txt from this and points crawlers to the sitemap.
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
