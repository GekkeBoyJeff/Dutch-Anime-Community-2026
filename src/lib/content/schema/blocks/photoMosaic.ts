import { z } from 'zod';

import { Colorset, Heading, Id, Media } from '@/lib/content/schema/primitives';

export const MosaicItem = z
	.object({
		id: Id,
		media: Media.describe('The photo shown in the mosaic cell'),
		caption: z.string().optional().describe('Short caption; revealed on hover (clean) or shown under the photo (scrapbook)'),
		span: z.enum(['standard', 'wide', 'tall']).optional().describe('How many grid cells the photo claims'),
	})
	.meta({ title: 'MosaicItem' });
export type MosaicItem = z.infer<typeof MosaicItem>;

// A community photo wall. `clean` is a tight rounded grid with hover zoom + caption overlay;
// `scrapbook` renders polaroid-style frames with slight rotations that straighten on hover.
export const PhotoMosaicProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the wall'),
		variant: z.enum(['clean', 'scrapbook']).optional().describe('Visual treatment of the photos; defaults to clean'),
		items: z.array(MosaicItem).min(3).describe('The photos in the wall'),
	})
	.meta({ title: 'PhotoMosaic' });
export type PhotoMosaicProps = z.infer<typeof PhotoMosaicProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const PhotoMosaicBlock = PhotoMosaicProps.extend({ type: z.literal('photoMosaic'), id: Id.optional() });
export type PhotoMosaicBlock = z.infer<typeof PhotoMosaicBlock>;
