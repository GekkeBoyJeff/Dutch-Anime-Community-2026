'use client';

import { useEffect } from 'react';

import type { ServiceWorkerProps as ServiceWorkerSchemaProps } from '@/lib/site/content/schema/basics/serviceWorker';

type ServiceWorkerProps = ServiceWorkerSchemaProps;

const ServiceWorker = ({ enabled = false }: ServiceWorkerProps) => {
	useEffect(() => {
		if (!('serviceWorker' in navigator)) {
			return;
		}

		// A worker left behind by an earlier PWA build keeps intercepting every request and serves the
		// site broken until storage is cleared by hand, so switching PWA off has to actively unregister.
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
				// The session flag stops a reload loop if unregistering fails.
				if (hadController && !sessionStorage.getItem('sw-cleanup')) {
					sessionStorage.setItem('sw-cleanup', '1');
					window.location.reload();
				}
			});
			return;
		}

		// A first install's claim (no prior controller) is not an update, so it must not reload.
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

		const base = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
		navigator.serviceWorker.register(`${base}/sw.js`, { scope: `${base}/` }).catch(() => {});

		return () => navigator.serviceWorker.removeEventListener('controllerchange', onControllerChange);
	}, [enabled]);

	return null;
};

export default ServiceWorker;
