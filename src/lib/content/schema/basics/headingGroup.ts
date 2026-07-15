import { z } from 'zod';

export const HeadingGroupProps = z
	.object({
		title: z.string().optional().describe('Title text'),
		size: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
			.optional()
			.describe('Visual size of the title (1–6); defaults to 2'),
		tagline: z.string().optional().describe('Small label above the title (or below, when reversed)'),
		intro: z.string().optional().describe('Supporting intro line under the title'),
		orientation: z.enum(['normal', 'reversed']).optional().describe('`reversed` renders the tagline below the title; defaults to normal'),
		align: z.enum(['start', 'center']).optional().describe('Horizontal alignment of the cluster; defaults to start'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'HeadingGroup' });
export type HeadingGroupProps = z.infer<typeof HeadingGroupProps>;
