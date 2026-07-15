import { z } from 'zod';

import { MediaShape } from '@/lib/content/schema/primitives';

// One gallery item. `url` makes the figure clickable; caption/credit annotate it.
// Derives from MediaShape (unrefined base): zod 4 forbids .pick() on the refined Media primitive.
export const GalleryItem = MediaShape.pick({ src: true, alt: true, ratio: true, caption: true, credit: true })
	.extend({
		src: z.string().min(1).describe('Image source'),
		url: z.string().optional().describe('Optional link target for the whole figure'),
	})
	.meta({ title: 'GalleryItem' });
export type GalleryItem = z.infer<typeof GalleryItem>;

// Image gallery in masonry/grid/strip layouts. Fully server-rendered: each item is a <figure> built
// from the Media primitive, optionally wrapped in Interactive when it links somewhere. The column
// count drives a --columns custom property the SCSS reads for grid and masonry.
export const GalleryProps = z
	.object({
		items: z.array(GalleryItem).optional().describe('The images to show; defaults to []'),
		variant: z.enum(['masonry', 'grid', 'strip']).optional().describe('Layout treatment: masonry columns, an even grid, or a horizontal strip; defaults to \'grid\''),
		columns: z.number().optional().describe('Column count for grid/masonry; defaults to 3'),
		gap: z.enum(['s', 'm', 'l', 'xl']).optional().describe('Gap between items; defaults to \'m\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Gallery' });
export type GalleryProps = z.infer<typeof GalleryProps>;
