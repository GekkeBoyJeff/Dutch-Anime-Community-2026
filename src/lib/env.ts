import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

// The environment contract — the env counterpart of lib/content, built on T3 Env (@t3-oss/env-nextjs).
// process.env is validated once against this schema when `env` is first imported; a missing or malformed
// value fails the build (and shows in the dev error-overlay) instead of surfacing as an `undefined` at
// request time. Every module reads the typed `env` export below instead of process.env directly, so this
// file (with .env.example) is the single source for "what the app reads from the environment".
//
// T3 Env enforces the server/client boundary: `server` values are never bundled into the browser, and
// reading one from a Client Component throws — secrets can't leak. `client` values must carry the
// NEXT_PUBLIC_ prefix (Next inlines them; they are public by design).
export const env = createEnv({
	server: {
		// Server-only secrets. Optional — unset (or empty) leaves the gated route closed (404); when set,
		// they must be non-empty. Reads go through `env`, so a gate can't depend on a stray process.env typo.
		DEBUG_SECRET: z.string().min(1).optional(),
		REVALIDATE_SECRET: z.string().min(1).optional(),
		SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
		// Build-time PWA opt-in (Serwist), exposed as a boolean — only the literal 'true' enables it.
		// (next.config.mjs reads the raw var itself: it runs before the @/ aliases resolve.)
		ENABLE_PWA: z
			.string()
			.optional()
			.transform((value) => value === 'true'),
	},
	shared: {
		// Set by Next/tooling; lives in `shared` because it exists on both the server and the client.
		NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
		// Build/deploy target: 'server' (default — a Node host that runs the dynamic features) or 'static'
		// (a static export for a static host; set by the deploy workflow). next.config.mjs
		// reads the raw var (it runs before the @/ aliases); app code reads env.HOST_TYPE.
		HOST_TYPE: z.enum(['server', 'static']).default('server'),
	},
	client: {
		// Public origin for metadata / canonical / OG / sitemap / robots / JSON-LD. Validated as a URL;
		// falls back to a placeholder so a fresh clone runs without a .env.
		NEXT_PUBLIC_SITE_URL: z.url().default('https://example.com'),
		// Subpath the site is served under (e.g. /my-app on a static host); empty by default.
		// next.config.mjs uses it for `basePath`; the service worker registers under it (see ServiceWorker).
		NEXT_PUBLIC_BASE_PATH: z.string().default(''),
		// Enables the builder on production/static deployments when 'true'.
		NEXT_PUBLIC_ENABLE_BUILDER: z
			.string()
			.optional()
			.transform((value) => value === 'true'),
		// Build stamp (date + time) injected by next.config.mjs at build time; versions the PWA page
		// caches and drives the "new version" toast. Falls back to 'dev' outside a real build.
		NEXT_PUBLIC_BUILD_VERSION: z.string().default('dev'),
		NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
	},
	// Next strips env vars that aren't referenced literally, so each one is mapped here explicitly.
	runtimeEnv: {
		DEBUG_SECRET: process.env.DEBUG_SECRET,
		REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		ENABLE_PWA: process.env.ENABLE_PWA,
		NODE_ENV: process.env.NODE_ENV,
		HOST_TYPE: process.env.HOST_TYPE,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
		NEXT_PUBLIC_ENABLE_BUILDER: process.env.NEXT_PUBLIC_ENABLE_BUILDER,
		NEXT_PUBLIC_BUILD_VERSION: process.env.NEXT_PUBLIC_BUILD_VERSION,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
	},
	// Treat `KEY=` (empty) as unset, so copying .env.example — which ships the secrets empty — keeps the
	// documented "empty = off / 404" behaviour instead of failing validation.
	emptyStringAsUndefined: true,
});

// Convenience flag for the static-export target (a static host like GitHub Pages) vs. a Node server
// host. Reads the validated env so callers don't repeat the string compare (used by seo.ts and
// site.ts). Intentionally no shared `isDev`: the NODE_ENV checks in client/build-time code read raw
// process.env on purpose so their dev-only branches are dead-code-eliminated from the browser bundle.
export const isStatic = env.HOST_TYPE === 'static';
