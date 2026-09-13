import { z } from 'zod';

import { Action } from '@/components/basics/Actions/Actions.schema';
import { Heading } from '@/lib/site/content/shared';

export const HeadingGroupProps = Heading.extend({
	element: z.string().optional().describe('The element tag to render; defaults to \'div\''),
	// The primitive requires a title; this component renders any one of title/tagline/intro alone.
	title: z.string().optional().describe('Title text'),
	orientation: z.enum(['normal', 'reversed', 'split']).optional().describe('`reversed` renders the tagline below the title, `split` puts the intro in its own column beside it from desktop up; defaults to normal'),
	align: z.enum(['start', 'center']).optional().describe('Horizontal alignment of the cluster; defaults to start'),
	actions: z.array(Action).optional().describe('Call-to-action buttons below the intro; in `split` they sit in the intro column'),
	className: z.string().optional().describe('Additional classes on the root element'),
}).meta({ title: 'HeadingGroup' });
export type HeadingGroupProps = z.infer<typeof HeadingGroupProps>;
