import { z } from 'zod';

export const SelectOption = z
	.object({
		value: z.string().min(1).describe('The submitted form value'),
		label: z.string().min(1).describe('Visible label (also used for typeahead)'),
		disabled: z.boolean().optional().describe('Renders the row but blocks selection'),
	})
	.meta({ title: 'SelectOption' });
export type SelectOption = z.infer<typeof SelectOption>;

export const SelectOptionGroup = z
	.object({
		label: z.string().min(1).describe('Group heading'),
		options: z.array(SelectOption).describe('Options under this heading'),
	})
	.meta({ title: 'SelectOptionGroup' });
export type SelectOptionGroup = z.infer<typeof SelectOptionGroup>;

// Props for the Select component: a single- or multi-select, either a custom listbox (Base UI Select) or a native <select>.
export const SelectProps = z
	.object({
		options: z.array(z.union([SelectOption, SelectOptionGroup])).optional().describe('Options, flat or grouped; defaults to []'),
		native: z
			.boolean()
			.optional()
			.describe(
				'Render a real, OS-styled <select> instead of the custom listbox — best for very long/simple lists and rock-solid mobile UX; defaults to false',
			),
		placeholder: z.string().optional().describe('Placeholder shown when nothing is chosen'),
		value: z.union([z.string(), z.array(z.string())]).optional().describe('Controlled value (string, or string[] when multiple)'),
		defaultValue: z.union([z.string(), z.array(z.string())]).optional().describe('Uncontrolled initial value'),
		multiple: z.boolean().optional().describe('Allow choosing more than one option; value becomes an array; defaults to false'),
		name: z.string().optional().describe('Submission key for native <form> submission'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		readOnly: z.boolean().optional().describe('Visible but not changeable'),
		required: z.boolean().optional().describe('Marks the field required before the form can submit'),
		side: z.enum(['top', 'bottom', 'left', 'right']).optional().describe('Preferred side for the popup; defaults to \'bottom\''),
		'aria-label': z.string().optional().describe('Accessible name when there is no visible <Field.Label>'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Select' });
export type SelectProps = z.infer<typeof SelectProps>;
