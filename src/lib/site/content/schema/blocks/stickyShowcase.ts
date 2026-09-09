import { z } from 'zod';

import { Colorset, Heading, Id, Media } from '@/lib/site/content/schema/primitives';

export const ShowcaseStep = z
	.object({
		id: Id,
		title: z.string().min(1).describe('Step heading text'),
		value: z.string().optional().describe('Supporting text shown under the step title').meta({ editor: 'richtext' }),
		media: Media.describe('The image shown on the pinned stage while this step is active'),
	})
	.meta({ title: 'ShowcaseStep' });
export type ShowcaseStep = z.infer<typeof ShowcaseStep>;

export const StickyShowcaseProps = z
	.object({
		colorset: Colorset.optional(),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the showcase'),
		steps: z.array(ShowcaseStep).min(2).max(5).describe('The steps that scroll past the pinned media stage'),
	})
	.meta({ title: 'StickyShowcase' });
export type StickyShowcaseProps = z.infer<typeof StickyShowcaseProps>;

export const StickyShowcaseBlock = StickyShowcaseProps.extend({ type: z.literal('stickyShowcase'), id: Id.optional() });
export type StickyShowcaseBlock = z.infer<typeof StickyShowcaseBlock>;
