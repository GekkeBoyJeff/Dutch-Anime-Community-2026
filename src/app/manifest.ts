import type { MetadataRoute } from 'next';

import { env } from '@/lib/shared/env';
import { site, brand } from '@/lib/site/site';

export const dynamic = 'force-static';

const manifest = (): MetadataRoute.Manifest => {
	// On a subpath host (e.g. GitHub Pages under /repo) every URL here must include that base, or an
	// installed app launches the domain root and 404s. Empty on a normal root host.
	const base = env.NEXT_PUBLIC_BASE_PATH;

	return {
		id: `${base}/`,
		name: site.name,
		short_name: site.name,
		description: site.description,
		start_url: `${base}/`,
		scope: `${base}/`,
		display: 'standalone',
		background_color: brand.page,
		theme_color: brand.warm,
		icons: [
			// Manifest icons are PNG: an SVG whose artwork is text fails in Chromium's sandboxed icon
			// decoder. The SVG lives on as the favicon instead (see metadata.icons in layout.tsx).
			{ src: `${base}/icon-192.png`, type: 'image/png', sizes: '192x192', purpose: 'any' },
			{ src: `${base}/icon-512.png`, type: 'image/png', sizes: '512x512', purpose: 'any' },
			{ src: `${base}/icon-maskable-512.png`, type: 'image/png', sizes: '512x512', purpose: 'maskable' },
		],
	};
};

export default manifest;
