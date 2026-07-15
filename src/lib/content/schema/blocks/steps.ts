import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

export const StepItem = z
	.object({
		id: Id,
		title: z.string().min(1).describe('Step title text shown next to the marker'),
		body: z.string().optional().describe('Optional supporting text shown below the step title'),
		/** Optional leading icon glyph name (the icon font is a placeholder, so never required) */
		icon: z.string().optional().describe('Optional icon glyph rendered in the marker instead of the step number').meta({ editor: 'icon' }),
	})
	.meta({ title: 'StepItem' });
export type StepItem = z.infer<typeof StepItem>;

export const StepsProps = z
	.object({
		colorset: Colorset.optional().describe('Background/text color theme of the section'),
		heading: Heading.optional().describe('Optional heading group (tagline, title, intro) shown above the steps list'),
		variant: z.enum(['process', 'progress']).optional().describe('Layout style: marketing "how it works" row, or compact multi-step progress strip'),
		/** Zero-based index of the active step; marks it aria-current and the ones before it as done */
		current: z.number().int().min(0).optional().describe('Zero-based index of the active step; earlier steps render as done'),
		// A steps block with no steps has nothing to show; require at least one.
		items: z.array(StepItem).min(1).describe('Ordered list of steps rendered in the block'),
	})
	.meta({ title: 'Steps' });
export type StepsProps = z.infer<typeof StepsProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const StepsBlock = StepsProps.extend({
	type: z.literal('steps'),
	id: Id.optional(),
});
export type StepsBlock = z.infer<typeof StepsBlock>;
