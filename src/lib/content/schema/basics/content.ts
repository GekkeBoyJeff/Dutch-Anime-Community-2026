import { z } from 'zod';

export const ContentProps = z
	.object({
		element: z.string().optional().describe('The HTML tag the text renders in; defaults to \'div\''),
		size: z
			.enum(['small', 'standard', 'large'])
			.optional()
			.describe(
				'Body size role: `standard` (default, no class) plus `small` / `large` overrides — each a responsive curve, not a fixed size; defaults to \'standard\'',
			),
		className: z.string().optional().describe('Additional classes on the root element'),
		value: z.string().optional().describe('The text; may contain HTML'),
	})
	.meta({ title: 'Content' });
export type ContentProps = z.infer<typeof ContentProps>;
