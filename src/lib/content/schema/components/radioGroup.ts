import { z } from 'zod';

// One selectable radio option within a RadioGroup.
export const RadioGroupOption = z
	.object({
		value: z.string().min(1).describe('Unique value selected when this radio is chosen'),
		label: z.string().optional().describe('Visible label'),
		disabled: z.boolean().optional().describe('Disable just this option'),
	})
	.meta({ title: 'RadioGroupOption' });
export type RadioGroupOption = z.infer<typeof RadioGroupOption>;

// Props for the RadioGroup component: a set of radios where exactly one may be selected.
export const RadioGroupProps = z
	.object({
		options: z.array(RadioGroupOption).optional().describe('The options to render'),
		value: z.string().optional().describe('Controlled selected value'),
		defaultValue: z.string().optional().describe('Uncontrolled initial value'),
		disabled: z.boolean().optional().describe('Disable the whole group'),
		required: z.boolean().optional().describe('Mark the group required for native form submission'),
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		'aria-label': z.string().optional().describe('Accessible name for the group (associate with a heading via aria-labelledby)'),
		'aria-labelledby': z.string().optional().describe('Id of the element that labels this group'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'RadioGroup' });
export type RadioGroupProps = z.infer<typeof RadioGroupProps>;
