/// <reference lib="webworker" />

import { defaultCache } from '@serwist/next/worker';
import type { PrecacheEntry, RuntimeCaching, SerwistGlobalConfig } from 'serwist';
import { Serwist, StaleWhileRevalidate } from 'serwist';

declare global {
	interface WorkerGlobalScope extends SerwistGlobalConfig {
		__SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
	}
}

declare const self: ServiceWorkerGlobalScope;

// The build stamp (date + time, injected at build) versions the page caches: a new build writes to
// fresh caches and the old ones are dropped on activate, while redeploying the same build keeps
// serving its existing caches untouched.
const BUILD_VERSION = process.env.NEXT_PUBLIC_BUILD_VERSION ?? 'dev';

// Pages and RSC payloads are served stale-while-revalidate: visitors get the cached copy instantly
// and the worker refreshes it in the background. These matchers run before defaultCache, so they
// win for documents/RSC; everything else (images, fonts, chunks) keeps Serwist's App Router defaults.
const versionedPageCache: RuntimeCaching[] = [
	{
		matcher: ({ request, sameOrigin }) => sameOrigin && request.destination === 'document',
		handler: new StaleWhileRevalidate({ cacheName: `pages-${BUILD_VERSION}` }),
	},
	{
		matcher: ({ request, sameOrigin }) => sameOrigin && request.destination === '' && request.headers.has('RSC'),
		handler: new StaleWhileRevalidate({ cacheName: `rsc-${BUILD_VERSION}` }),
	},
];

// Precaches the build output (injected as __SW_MANIFEST) and runtime-caches navigations + RSC via
// the versioned SWR caches above, falling back to Serwist's App-Router-aware defaultCache.
const serwist = new Serwist({
	precacheEntries: self.__SW_MANIFEST,
	// Updates apply automatically: the new worker activates immediately and ServiceWorker.tsx
	// reloads the page once when it takes control, so visitors move to the new build without a prompt.
	skipWaiting: true,
	clientsClaim: true,
	navigationPreload: true,
	runtimeCaching: [...versionedPageCache, ...defaultCache],
	fallbacks: {
		// Static HTML fallback for an offline navigation to a never-visited page (a Next page route
		// here would cause Chrome redirect flicker — see serwist#174).
		entries: [
			{
				// Base-path aware so the offline page resolves under a static host's subpath.
				url: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/offline.html`,
				matcher: ({ request }) => request.destination === 'document',
			},
		],
	},
});

// Drop versioned page caches from older builds once this build's worker takes over.
self.addEventListener('activate', (event) => {
	event.waitUntil(
		(async () => {
			const keys = await caches.keys();
			await Promise.all(
				keys
					.filter((key) => /^(pages|rsc)-/.test(key) && !key.endsWith(BUILD_VERSION))
					.map((key) => caches.delete(key)),
			);
		})(),
	);
});

// Web-push (fase 8): toon de melding uit de payload; open bij een klik de bijbehorende pagina (of focus een
// bestaand tabblad). De payload komt van de send-push Edge Function: { title, body, url }.
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// De composer-link is root-relatief ("/dashboard/…"); op een subpad-host leeft de hele app onder BASE, dus
// prefix hem net als de eigen SW-URL's (no-op als BASE leeg is of de link al geprefixt/absoluut is).
const withBase = (u: string): string => (BASE && u.startsWith('/') && !u.startsWith(`${BASE}/`) ? `${BASE}${u}` : u);

self.addEventListener('push', (event) => {
	let data: { title?: string; body?: string; url?: string } = {};
	try {
		data = event.data?.json() ?? {};
	} catch {
		data = { body: event.data?.text() ?? '' };
	}
	event.waitUntil(
		self.registration.showNotification(data.title ?? 'Dutch Anime Community', {
			body: data.body ?? '',
			icon: `${BASE}/icon-192.png`,
			badge: `${BASE}/icon-192.png`,
			data: { url: data.url ? withBase(data.url) : `${BASE}/account` },
		}),
	);
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const raw = (event.notification.data as { url?: string } | undefined)?.url;
	const url = raw ? withBase(raw) : `${BASE}/account`;
	event.waitUntil(
		(async () => {
			const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
			const open = windows.find((client) => 'focus' in client) as WindowClient | undefined;
			if (open) {
				await open.focus();
				await open.navigate(url).catch(() => undefined);
			} else {
				await self.clients.openWindow(url);
			}
		})(),
	);
});

serwist.addEventListeners();
