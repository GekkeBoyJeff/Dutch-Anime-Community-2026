import { z } from 'zod';

import { MediaShape } from '@/lib/site/content/schema/shared';

// Derives from MediaShape (unrefined base): zod 4 forbids .pick() on the refined Media primitive.
export const GalleryItem = MediaShape.pick({
	src: true,
	alt: true,
	ratio: true,
	caption: true,
	credit: true,
})
	.extend({
		src: z.string().min(1).describe('Image source'),
		href: z.string().optional().describe('Optional link target for the whole figure'),
	})
	.meta({ title: 'GalleryItem' });
export type GalleryItem = z.infer<typeof GalleryItem>;

export const GalleryProps = z
	.object({
		items: z.array(GalleryItem).optional().describe('The images to show; defaults to []'),
		variant: z.enum(['masonry', 'grid', 'strip']).optional().describe('Layout treatment: masonry columns, an even grid, or a horizontal strip; defaults to \'grid\''),
		columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Column count for grid/masonry; defaults to 3'),
		gap: z.enum(['s', 'm', 'l', 'xl']).optional().describe('Gap between items; defaults to \'m\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Gallery' });
export type GalleryProps = z.infer<typeof GalleryProps>;
