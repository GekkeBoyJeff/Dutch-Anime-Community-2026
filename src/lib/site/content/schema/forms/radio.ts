import type { ReactNode } from 'react';
import { z } from 'zod';

// Always rendered inside a RadioGroup, which owns the selected value.
export const RadioProps = z
	.object({
		value: z.string().min(1).describe('The value this choice selects in its group'),
		readOnly: z.boolean().optional().describe('Visible but not changeable'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		required: z.boolean().optional().describe('Marks this choice required before the form can submit'),
		id: z.string().optional().describe('The id on the hidden input, to wire up an external <label htmlFor>'),
		label: z.string().optional().describe('Inline label text (may contain HTML); children win over this'),
		children: z.custom<ReactNode>().optional().describe('Inline label content; takes precedence over `label`'),
		ariaLabel: z.string().optional().describe('Accessible name when there is no visible label'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Radio' });
export type RadioProps = z.infer<typeof RadioProps>;
