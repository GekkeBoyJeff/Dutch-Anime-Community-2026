import type { Ref } from 'react';
import { z } from 'zod';

export const RadioGroupOption = z
	.object({
		value: z.string().min(1).describe('Unique value selected when this radio is chosen'),
		label: z.string().optional().describe('Visible label'),
		share: z
			.number()
			.min(0)
			.max(100)
			.optional()
			.describe('Share of the total this option holds, 0-100; adds a fill bar and a percentage to the row'),
		picked: z.boolean().optional().describe('Marks this option as the answer the viewer gave earlier; adds a check to the row'),
		disabled: z.boolean().optional().describe('Disable just this option'),
	})
	.meta({ title: 'RadioGroupOption' });
export type RadioGroupOption = z.infer<typeof RadioGroupOption>;

export const RadioGroupProps = z
	.object({
		options: z.array(RadioGroupOption).optional().describe('The options to render'),
		value: z.string().optional().describe('Controlled selected value'),
		defaultValue: z.string().optional().describe('Uncontrolled initial value'),
		onValueChange: z.custom<(value: string) => void>().optional().describe('Fires with the newly selected value'),
		horizontal: z.boolean().optional().describe('Lay the choices out in a row instead of a column; defaults to false'),
		disabled: z.boolean().optional().describe('Disable the whole group'),
		required: z.boolean().optional().describe('Mark the group required for native form submission'),
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		pickedLabel: z.string().optional().describe('Hidden text naming why an option is marked `picked`, read out after its label'),
		ariaLabel: z.string().optional().describe('Accessible name for the group (associate with a heading via aria-labelledby)'),
		'aria-labelledby': z.string().optional().describe('Id of the element that labels this group'),
		className: z.string().optional().describe('Additional classes on the root element'),
		ref: z.custom<Ref<HTMLDivElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'RadioGroup' });
export type RadioGroupProps = z.infer<typeof RadioGroupProps>;
