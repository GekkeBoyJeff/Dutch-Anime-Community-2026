import { z } from 'zod';

// Token-driven loading placeholder with a CSS-only shimmer (gated by prefers-reduced-motion).
export const SkeletonProps = z
	.object({
		width: z.string().optional().describe('Explicit width (any CSS length); defaults to 100%'),
		height: z.string().optional().describe('Explicit height; defaults to one line'),
		radius: z
			.enum(['s', 'm', 'l', 'full'])
			.optional()
			.describe('Corner radius preset; defaults to \'m\''),
		circle: z.boolean().optional().describe('Square 1:1 circle (for avatars/thumbnails)'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Skeleton' });
export type SkeletonProps = z.infer<typeof SkeletonProps>;
