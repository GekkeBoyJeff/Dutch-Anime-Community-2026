import type { CSSProperties } from 'react';
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
		id: z.string().optional().describe('Id on the root element, so an aria-describedby elsewhere can point at this text'),
		role: z.string().optional().describe('ARIA role on the root element, e.g. \'alert\' or \'status\' to announce this text as a live region'),
		ariaCurrent: z
			.enum(['page', 'step', 'location', 'date', 'time', 'true', 'false'])
			.optional()
			.describe('Marks this text as the current item within a set, e.g. \'page\' for the last breadcrumb; renders aria-current'),
		style: z.custom<CSSProperties>().optional().describe('Inline style for computed values a class cannot express, e.g. a CSS custom property'),
	})
	.meta({ title: 'Content' });
export type ContentProps = z.infer<typeof ContentProps>;
