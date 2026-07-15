import { z } from 'zod';

import { Colorset, Heading, Id, Media } from '@/lib/content/schema/primitives';

export const ShowcaseStep = z
	.object({
		id: Id,
		title: z.string().min(1).describe('Step heading text'),
		body: z.string().optional().describe('Supporting text shown under the step title').meta({ editor: 'richtext' }),
		media: Media.describe('The image shown on the pinned stage while this step is active'),
	})
	.meta({ title: 'ShowcaseStep' });
export type ShowcaseStep = z.infer<typeof ShowcaseStep>;

// An Apple-style scroll showcase: the media stage pins while the steps scroll past, crossfading the
// stage image per active step. On small screens the stage unpins and each step shows its own media.
export const StickyShowcaseProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the showcase'),
		steps: z.array(ShowcaseStep).min(2).max(5).describe('The steps that scroll past the pinned media stage'),
	})
	.meta({ title: 'StickyShowcase' });
export type StickyShowcaseProps = z.infer<typeof StickyShowcaseProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const StickyShowcaseBlock = StickyShowcaseProps.extend({ type: z.literal('stickyShowcase'), id: Id.optional() });
export type StickyShowcaseBlock = z.infer<typeof StickyShowcaseBlock>;
