import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
	server: {
		// Optional on purpose: unset leaves the gated route closed (404), so a fresh clone still builds.
		DEBUG_SECRET: z.string().min(1).optional(),
		REVALIDATE_SECRET: z.string().min(1).optional(),
		SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),
		// next.config.mjs reads the raw var itself: it runs before the @/ aliases resolve.
		ENABLE_PWA: z
			.string()
			.optional()
			.transform((value) => value === 'true'),
		CONTENT_CHANNEL: z.enum(['draft', 'published']).optional(),
		// Unset infers the source from SUPABASE_SERVICE_ROLE_KEY; 'registry' forces the typed files in
		// src/content even when that key is present.
		CONTENT_SOURCE: z.enum(['registry', 'supabase']).optional(),
	},
	shared: {
		// In `shared`, not `server`: both halves read it, and a server-only value throws in the browser.
		NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
		// next.config.mjs reads the raw var itself: it runs before the @/ aliases resolve.
		HOST_TYPE: z.enum(['server', 'static']).default('server'),
	},
	client: {
		NEXT_PUBLIC_SITE_URL: z.url().default('https://example.com'),
		NEXT_PUBLIC_BASE_PATH: z.string().default(''),
		NEXT_PUBLIC_ENABLE_BUILDER: z
			.string()
			.optional()
			.transform((value) => value === 'true'),
		// Injected by next.config.mjs at build time; 'dev' outside a real build.
		NEXT_PUBLIC_BUILD_VERSION: z.string().default('dev'),
		NEXT_PUBLIC_SUPABASE_URL: z.url().optional(),
		NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),
		// Only the PUBLIC VAPID key belongs here; the private one lives as an Edge Function secret.
		NEXT_PUBLIC_VAPID_PUBLIC_KEY: z.string().min(1).optional(),
	},
	// Next strips env vars that aren't referenced literally, so each one is mapped here explicitly.
	runtimeEnv: {
		DEBUG_SECRET: process.env.DEBUG_SECRET,
		REVALIDATE_SECRET: process.env.REVALIDATE_SECRET,
		SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
		ENABLE_PWA: process.env.ENABLE_PWA,
		CONTENT_CHANNEL: process.env.CONTENT_CHANNEL,
		CONTENT_SOURCE: process.env.CONTENT_SOURCE,
		NODE_ENV: process.env.NODE_ENV,
		HOST_TYPE: process.env.HOST_TYPE,
		NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
		NEXT_PUBLIC_BASE_PATH: process.env.NEXT_PUBLIC_BASE_PATH,
		NEXT_PUBLIC_ENABLE_BUILDER: process.env.NEXT_PUBLIC_ENABLE_BUILDER,
		NEXT_PUBLIC_BUILD_VERSION: process.env.NEXT_PUBLIC_BUILD_VERSION,
		NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
		NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
		NEXT_PUBLIC_VAPID_PUBLIC_KEY: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
	},
	// Treat `KEY=` (empty) as unset, so copying .env.example — which ships the secrets empty — keeps the
	// documented "empty = off / 404" behaviour instead of failing validation.
	emptyStringAsUndefined: true,
});

// Intentionally no shared `isDev`: the NODE_ENV checks in client/build-time code read raw
// process.env on purpose, so their dev-only branches are dead-code-eliminated from the browser bundle.
export const isStatic = env.HOST_TYPE === 'static';
