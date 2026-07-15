import { z } from 'zod';

export const CustomCursorProps = z
	.object({
		lerp: z
			.number()
			.optional()
			.describe('Easing factor for the trailing circle, 0–1; lower trails further behind; defaults to 0.15'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'CustomCursor' });

export type CustomCursorProps = z.infer<typeof CustomCursorProps>;
