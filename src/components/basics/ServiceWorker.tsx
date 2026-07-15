'use client';

import { useEffect } from 'react';

interface ServiceWorkerProps {
	/** Whether the PWA build is enabled; when false any previously registered worker is removed */
	enabled?: boolean;
}

// Registers the Serwist service worker when the PWA build is enabled. Updates are automatic: the
// new build's worker activates immediately (skipWaiting in sw.ts) and this component reloads the
// page once when it takes control, so visitors land on the new version without a prompt. When PWA
// is off (regular builds, dev), it actively unregisters instead: a worker left behind by an earlier
// PWA build — or by another project that ran on this port — keeps intercepting every request and
// serves the site broken until storage is cleared by hand.
const ServiceWorker = ({ enabled = false }: ServiceWorkerProps) => {
	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			return;
		}

		if (!enabled || process.env.NODE_ENV !== 'production') {
			navigator.serviceWorker.getRegistrations().then(async (registrations) => {
				if (registrations.length === 0) {
					return;
				}
				const hadController = Boolean(navigator.serviceWorker.controller);
				await Promise.all(registrations.map((registration) => registration.unregister()));
				if ('caches' in window) {
					const keys = await caches.keys();
					await Promise.all(keys.map((key) => caches.delete(key)));
				}
				// Unregistering doesn't release this page from the old worker; reload once so it
				// fetches from the network again. The session flag stops a loop if unregistering fails.
				if (hadController && !sessionStorage.getItem('sw-cleanup')) {
					sessionStorage.setItem('sw-cleanup', '1');
					window.location.reload();
				}
			});
			return;
		}

		// A controller change on a page that already had one means a new build just activated —
		// reload once onto the new version. A first install's claim (no prior controller) is not an
		// update, so it never triggers the reload. See https://web.dev/articles/service-worker-lifecycle
		const hadController = Boolean(navigator.serviceWorker.controller);
		let reloaded = false;
		const onControllerChange = () => {
			if (!hadController || reloaded) {
				return;
			}
			reloaded = true;
			window.location.reload();
		};
		navigator.serviceWorker.addEventListener('controllerchange', onControllerChange);

		// Register under the base path so the worker's scope matches a subpath the site is served under
		// (a static host under /my-app). Empty base = the origin root, the normal case.
		const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
		navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {
			// Registration failures are non-fatal: the site works fine without the service worker.
		});

		return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
	}, [enabled]);

	return null;
};

export default ServiceWorker;
