import { z } from 'zod';

export const SwitchProps = z
	.object({
		checked: z.boolean().optional().describe('Controlled on/off state; omit for an uncontrolled switch'),
		defaultChecked: z.boolean().optional().describe('Uncontrolled initial state'),
		onCheckedChange: z.custom<(checked: boolean) => void>().optional().describe('Fires on toggle with the new boolean (Base UI\'s two-arg event is re-narrowed for us)'),
		readOnly: z.boolean().optional().describe('Visible but not toggleable'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		required: z.boolean().optional().describe('Marks the field required for native form submission'),
		name: z.string().optional().describe('Hidden-input name for native <form> submission'),
		value: z.string().optional().describe('Submitted value when on (defaults to \'on\')'),
		id: z.string().optional().describe('The id applied to the hidden input, to wire up an external <label htmlFor>'),
		ariaLabel: z.string().optional().describe('Accessible name when there is no visible label'),
		'aria-labelledby': z.string().optional().describe('Id of the element that labels this switch'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Switch' });
export type SwitchProps = z.infer<typeof SwitchProps>;
