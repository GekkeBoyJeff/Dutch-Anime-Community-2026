import { z } from 'zod';

// One selectable checkbox option within a CheckboxGroup.
export const CheckboxOption = z
	.object({
		value: z.string().min(1).describe('Unique value, added to the ticked array when this box is on'),
		label: z.string().optional().describe('Visible label'),
		disabled: z.boolean().optional().describe('Disable just this option'),
	})
	.meta({ title: 'CheckboxOption' });
export type CheckboxOption = z.infer<typeof CheckboxOption>;

// Props for the CheckboxGroup component: a set of related checkboxes sharing one ticked-values array.
export const CheckboxGroupProps = z
	.object({
		options: z.array(CheckboxOption).optional().describe('The options to render; defaults to []'),
		value: z.array(z.string()).optional().describe('Controlled set of ticked values'),
		defaultValue: z.array(z.string()).optional().describe('Uncontrolled initial ticked set'),
		disabled: z.boolean().optional().describe('Disable the whole group'),
		'aria-label': z.string().optional().describe('Accessible name for the group (associate with a heading via aria-labelledby)'),
		'aria-labelledby': z.string().optional().describe('Id of the element that labels this group'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'CheckboxGroup' });
export type CheckboxGroupProps = z.infer<typeof CheckboxGroupProps>;
