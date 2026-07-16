import withSerwistInit from '@serwist/next';

import { SCSS_LOAD_PATHS, SCSS_PRELUDE } from './styles.config.mjs';

const isDev = process.env.NODE_ENV === 'development';

// Build stamp (date + time) baked into the client bundle and the service worker at build time. It
// versions the runtime page caches and shows in the "new version" toast — a new build gets a new
// stamp, an unchanged build keeps serving its existing caches.
const buildVersion = new Date().toISOString().slice(0, 16).replace('T', ' ');

// Static security headers — no per-request nonce, so the site stays fully prerendered (a nonce-based
// CSP would force dynamic rendering and disable static optimization/ISR/CDN caching). The CSP uses
// 'unsafe-inline' because a static Next build emits inline bootstrap scripts/styles and there is no
// nonce; this is Next's documented no-nonce baseline. Tighten via the experimental `sri` option (a
// static-compatible strict CSP) when stricter guarantees are needed.
//
// The CSP is NOT applied in development: dev already requires 'unsafe-eval', and the visual builder's
// AutoFrame (srcdoc iframe) cannot load same-origin stylesheets under a strict CSP. Since the builder
// is dev-only tooling, skipping the CSP in dev keeps the config simple and the editor functional.
//
// No upgrade-insecure-requests: WebKit applies it to http://localhost (Chromium exempts it), so a
// local `next start` serves a page whose subresources all upgrade to https and fail TLS — a fully
// unstyled site in Safari. All assets are same-origin, so on a real https deploy it adds nothing.
// Supabase origin (+ its websocket) for the CSP — derived from the public env so it tracks the project.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseOrigin = supabaseUrl ? new URL(supabaseUrl).origin : '';
const supabaseWs = supabaseOrigin ? supabaseOrigin.replace(/^https/, 'wss') : '';

const cspHeader = `
	default-src 'self';
	script-src 'self' 'unsafe-inline';
	style-src 'self' 'unsafe-inline';
	img-src 'self' blob: data: ${supabaseOrigin};
	font-src 'self';
	connect-src 'self' ${supabaseOrigin} ${supabaseWs};
	frame-src 'self' https://www.youtube-nocookie.com https://player.vimeo.com https://www.tiktok.com https://fast.wistia.net https://fast.wistia.com;
	object-src 'none';
	base-uri 'self';
	form-action 'self';
	frame-ancestors 'none';
`
	.replace(/\s{2,}/g, ' ')
	.trim();

// When the builder is enabled in production (NEXT_PUBLIC_ENABLE_BUILDER=true), the editor needs the
// Inter font from rsms.me. This relaxation is scoped to the /builder route only.
const builderCspHeader = cspHeader
	.replace("style-src 'self' 'unsafe-inline'", "style-src 'self' 'unsafe-inline' https://rsms.me")
	.replace("font-src 'self'", "font-src 'self' https://rsms.me")
	.replace("frame-ancestors 'none'", "frame-ancestors 'self'");

const securityHeaders = [
	{ key: 'Content-Security-Policy', value: cspHeader },
	{ key: 'X-Content-Type-Options', value: 'nosniff' },
	{ key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
	{ key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
	{ key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const isStatic = process.env.HOST_TYPE === 'static';
const builderEnabled = isDev || process.env.NEXT_PUBLIC_ENABLE_BUILDER === 'true';

/** @type {import('next').NextConfig} */
const nextConfig = {
	// Static hosts (DirectAdmin/Apache) resolve <route>/index.html natively via DirectoryIndex. Without
	// a trailing slash the export writes <route>.html, which collides with the per-route RSC payload
	// directory of the same name — so requests to /dashboard hit an index-less folder. Trailing slash
	// keeps every route directory-based and needs zero rewrite rules or host-specific Options.
	trailingSlash: true,
	env: {
		NEXT_PUBLIC_BUILD_VERSION: buildVersion,
	},

	sassOptions: {
		implementation: 'sass-embedded',
		loadPaths: SCSS_LOAD_PATHS,
		additionalData: SCSS_PRELUDE,
	},

	...(isStatic && {
		output: 'export',
		basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
		images: { unoptimized: true },
	}),

	...(!isStatic && {
		// In dev the CSP is skipped so Puck's AutoFrame iframe can load same-origin stylesheets.
		// In production the builder gets a relaxed CSP for its fonts/iframe; all other routes get
		// the strict policy.
		async headers() {
			if (isDev) return [];
			return [
				{ source: '/:path*', headers: securityHeaders },
				...(builderEnabled
					? [{ source: '/builder', headers: [{ key: 'Content-Security-Policy', value: builderCspHeader }] }]
					: []),
			];
		},
		...(!builderEnabled && {
			async rewrites() {
				return { beforeFiles: [{ source: '/builder', destination: '/development-only' }] };
			},
		}),
	}),
};

// PWA is opt-in. Build with `ENABLE_PWA=true next build --webpack` to generate + register the Serwist
// service worker (offline browsing). Off by default so the standard build stays plain Turbopack and
// consumers don't inherit aggressive caching.
const enablePwa = process.env.ENABLE_PWA === 'true';

const withSerwist = withSerwistInit({
	swSrc: 'src/sw.ts',
	swDest: 'public/sw.js',
	cacheOnNavigation: true,
	register: false,
	disable: !enablePwa,
});

export default enablePwa ? withSerwist(nextConfig) : nextConfig;
