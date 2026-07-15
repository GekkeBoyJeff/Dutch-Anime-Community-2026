import { z } from 'zod';

// Props for the Checkbox component: a single tick-box, wraps Base UI's Checkbox.
export const CheckboxProps = z
	.object({
		name: z.string().optional().describe('Submission key for native <form> submission'),
		checked: z.boolean().optional().describe('Controlled ticked state; omit for an uncontrolled checkbox'),
		defaultChecked: z.boolean().optional().describe('Uncontrolled initial ticked state'),
		indeterminate: z.boolean().optional().describe('Mixed state: neither ticked nor unticked (e.g. a parent of partially-selected children)'),
		value: z.string().optional().describe('Submitted value when ticked (defaults to "on")'),
		readOnly: z.boolean().optional().describe('Visible but not toggleable'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		required: z.boolean().optional().describe('Marks the box required before the form can submit'),
		id: z.string().optional().describe('The id on the hidden input, to wire up an external <label htmlFor>'),
		label: z.string().optional().describe('Inline label text (may contain HTML); children win over this'),
		'aria-label': z.string().optional().describe('Accessible name when there is no visible label'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Checkbox' });
export type CheckboxProps = z.infer<typeof CheckboxProps>;
