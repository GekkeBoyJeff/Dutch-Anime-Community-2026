import { z } from 'zod';

export const ScrollProgressProps = z
	.object({
		target: z.string().optional().describe('CSS selector of the element whose scroll drives the bar; omit to track the page'),
		position: z
			.enum(['top', 'bottom'])
			.optional()
			.describe('Pin the bar to the top or bottom of the viewport; defaults to \'top\''),
		color: z
			.enum(['primary', 'secondary'])
			.optional()
			.describe('Which brand colour fills the bar; defaults to \'primary\''),
		height: z.string().optional().describe('Bar thickness, any CSS length; defaults to \'3px\''),
	})
	.meta({ title: 'ScrollProgress' });

export type ScrollProgressProps = z.infer<typeof ScrollProgressProps>;
