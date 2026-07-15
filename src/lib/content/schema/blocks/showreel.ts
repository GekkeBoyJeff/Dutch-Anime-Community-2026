import { z } from 'zod';

import { SwiperSlide } from '@/lib/content/schema/components/swiper';
import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

// A case-style showreel: large rounded media slides with captions, arrow controls and an optional
// video slide that opens the shared lightbox — the Swiper component promoted to a page block.
export const ShowreelProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the reel'),
		slides: z.array(SwiperSlide).min(2).describe('The slides: image or video (poster + provider/src)'),
		ratio: z.string().optional().describe('Aspect ratio of the slide frame, e.g. \'16 / 9\''),
		loop: z.boolean().optional().describe('Loop back to the first slide after the last'),
		showCounter: z.boolean().optional().describe('Show the \'current / total\' counter beside the controls'),
	})
	.meta({ title: 'Showreel' });
export type ShowreelProps = z.infer<typeof ShowreelProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const ShowreelBlock = ShowreelProps.extend({ type: z.literal('showreel'), id: Id.optional() });
export type ShowreelBlock = z.infer<typeof ShowreelBlock>;
