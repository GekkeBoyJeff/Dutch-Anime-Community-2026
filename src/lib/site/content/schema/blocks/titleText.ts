import { z } from 'zod';

import { Action } from '@/lib/site/content/schema/basics/actions';
import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

export const TitleTextProps = z.object({
	colorset: Colorset.optional(),
	heading: Heading.optional().describe('Heading cluster (tagline, title and intro) shown above the body text'),
	value: z.string().optional().describe('Rich-text body content rendered below the heading').meta({ editor: 'richtext' }),
	actions: z.array(Action).optional().describe('Row of call-to-action buttons rendered below the text'),
	align: z.enum(['start', 'center']).optional().describe('Horizontal alignment of the heading, text and actions'),
}).meta({ title: 'TitleText' });
export type TitleTextProps = z.infer<typeof TitleTextProps>;

export const TitleTextBlock = TitleTextProps.extend({
	type: z.literal('titleText'),
	id: Id.optional(),
});
export type TitleTextBlock = z.infer<typeof TitleTextBlock>;
