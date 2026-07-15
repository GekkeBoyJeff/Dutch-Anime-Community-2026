import { z } from 'zod';

import { Media, MediaShape } from '@/lib/content/schema/primitives';

// Props for the ImageList component: grid/featured/masonry/mosaic arrangement of Media items — the
// simpler sibling of Gallery, with no captions or links. Shared `mediaOptions` are spread first,
// then each item's own props override them, so a gallery can set one ratio centrally.
export const ImageListProps = z
	.object({
		items: z.array(Media).optional().describe('The media items; each carries the Media primitive\'s own props; defaults to []'),
		// MediaShape (unrefined base): zod 4 forbids .partial() on the refined Media primitive.
		mediaOptions: MediaShape.partial().optional().describe('Defaults merged into every item (e.g. a shared ratio); per-item props win'),
		layout: z.enum(['grid', 'featured', 'masonry', 'mosaic']).optional().describe('Arrangement of the items; defaults to \'grid\''),
		columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Column count for grid/masonry; defaults to 3'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'ImageList' });
export type ImageListProps = z.infer<typeof ImageListProps>;
