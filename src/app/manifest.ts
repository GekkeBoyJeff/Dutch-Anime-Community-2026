import type { MetadataRoute } from 'next';

import { env } from '@/lib/env';
import { site, brand } from '@/lib/site';

// Content-derived and static; marking it static lets `output: export` emit a plain file.
export const dynamic = 'force-static';

// Web app manifest (served at /manifest.webmanifest; Next links it automatically). Makes the site
// installable. Colours are brand placeholders — match them to your tokens in src/styles.
const manifest = (): MetadataRoute.Manifest => {
	// On a subpath host (e.g. GitHub Pages under /repo) every URL here must include that base, or an
	// installed app launches the domain root and 404s. Empty on a normal root host, so this is a no-op there.
	const base = env.NEXT_PUBLIC_BASE_PATH;

	return {
		// The app's stable identity. Including the base keeps it unique per deployment on a shared origin
		// like github.io, where two repos would otherwise collide on the same id.
		id: `${base}/`,
		name: site.name,
		short_name: site.name,
		description: site.description,
		start_url: `${base}/`,
		scope: `${base}/`,
		display: 'standalone',
		// From the shared brand palette (src/lib/site.ts), so theme_color stays in lockstep with the
		// viewport themeColor in layout.tsx.
		background_color: brand.page,
		theme_color: brand.warm,
		icons: [
			// Manifest icons are PNG: Chromium rasterises these for OS install and (unlike SVG) decodes
			// them reliably — an SVG whose artwork is text fails in the sandboxed icon decoder. The SVG
			// lives on as the favicon instead (see metadata.icons in layout.tsx).
			{ src: `${base}/icon-192.png`, type: 'image/png', sizes: '192x192', purpose: 'any' },
			{ src: `${base}/icon-512.png`, type: 'image/png', sizes: '512x512', purpose: 'any' },
			// Maskable = full-bleed art the OS masks into its own shape (Android adaptive icons).
			{ src: `${base}/icon-maskable-512.png`, type: 'image/png', sizes: '512x512', purpose: 'maskable' },
		],
		// Optional extras, all OFF by default. To enable one, uncomment its single snippet line —
		// the one starting with a property name. The explanation lines above it stay comments.

		// Screenshots — Chromium's richer install UI. App-specific; screenshots of the same
		// form_factor must share one aspect ratio. Add the images to /public first, then uncomment:
		// screenshots: [{ src: '/screenshot-wide.png', type: 'image/png', sizes: '1280x720', form_factor: 'wide' }, { src: '/screenshot-narrow.png', type: 'image/png', sizes: '720x1280', form_factor: 'narrow' }],

		// Protocol handlers — the installed app opens custom-scheme links (clicking
		// `web+acme:share?id=42` launches it). The url MUST contain `%s` and resolve to a real
		// route; the scheme must be `web+…`. Build the /handle route first, then uncomment:
		// protocol_handlers: [{ protocol: 'web+acme', url: '/handle?link=%s' }],

		// Display override — opt into newer display modes. `window-controls-overlay` extends your
		// UI into the desktop title bar; style it with the env(titlebar-area-*) CSS vars first, or
		// content hides behind the window buttons. Then uncomment:
		// display_override: ['window-controls-overlay', 'standalone', 'minimal-ui'],
	};
};

export default manifest;
