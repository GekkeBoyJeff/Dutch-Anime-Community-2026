import { z } from 'zod';

import { Action, Colorset, Heading, Id } from '@/lib/content/schema/primitives';

// The most generic prose block: a heading cluster, a rich-text body and a row of actions. Reuses
// the shared Heading and Action primitives so its shape matches every other block's.
export const TitleTextProps = z.object({
	colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
	heading: Heading.optional().describe('Heading cluster (tagline, title and intro) shown above the body text'),
	text: z.string().optional().describe('Rich-text body content rendered below the heading').meta({ editor: 'richtext' }),
	actions: z.array(Action).optional().describe('Row of call-to-action buttons rendered below the text'),
	align: z.enum(['start', 'center']).optional().describe('Horizontal alignment of the heading, text and actions'),
}).meta({ title: 'TitleText' });
export type TitleTextProps = z.infer<typeof TitleTextProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const TitleTextBlock = TitleTextProps.extend({
	type: z.literal('titleText'),
	id: Id.optional(),
});
export type TitleTextBlock = z.infer<typeof TitleTextBlock>;
