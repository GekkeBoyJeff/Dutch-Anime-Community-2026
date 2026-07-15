import { z } from 'zod';

export const RadioOption = z
	.object({
		value: z.string().min(1).describe('The submitted form value'),
		label: z.string().min(1).describe('Visible label (may contain HTML)'),
		disabled: z.boolean().optional().describe('Renders the choice but blocks selection'),
	})
	.meta({ title: 'RadioOption' });
export type RadioOption = z.infer<typeof RadioOption>;

export const RadioProps = z
	.object({
		options: z.array(RadioOption).optional().describe('The choices to render as a group; defaults to []'),
		name: z.string().optional().describe('Submission key for native <form> submission'),
		value: z.string().optional().describe('Controlled selected value; omit for an uncontrolled group'),
		defaultValue: z.string().optional().describe('Uncontrolled initial selected value'),
		horizontal: z.boolean().optional().describe('Lay the choices out in a row instead of a column; defaults to false'),
		readOnly: z.boolean().optional().describe('Visible but not changeable'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the whole group'),
		required: z.boolean().optional().describe('Marks a choice required before the form can submit'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Radio' });
export type RadioProps = z.infer<typeof RadioProps>;
