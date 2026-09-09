import { z } from 'zod';

import { Heading } from '@/lib/site/content/schema/primitives';

export const HeadingGroupProps = Heading.extend({
	element: z.string().optional().describe('The element tag to render; defaults to \'div\''),
	// The primitive requires a title; this component renders any one of title/tagline/intro alone.
	title: z.string().optional().describe('Title text'),
	orientation: z.enum(['normal', 'reversed']).optional().describe('`reversed` renders the tagline below the title; defaults to normal'),
	align: z.enum(['start', 'center']).optional().describe('Horizontal alignment of the cluster; defaults to start'),
	className: z.string().optional().describe('Additional classes on the root element'),
}).meta({ title: 'HeadingGroup' });
export type HeadingGroupProps = z.infer<typeof HeadingGroupProps>;
