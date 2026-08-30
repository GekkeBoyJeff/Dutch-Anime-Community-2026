import { z } from 'zod';

export const ServiceWorkerProps = z
	.object({
		enabled: z
			.boolean()
			.optional()
			.describe('Registers /sw.js in production; when off (or outside production) any worker left by an earlier PWA build is unregistered and its caches cleared; defaults to false'),
	})
	.meta({ title: 'ServiceWorker' });
export type ServiceWorkerProps = z.infer<typeof ServiceWorkerProps>;
