import { z } from 'zod';

// Props for the TextArea component: a multi-line text control rendered via Field.Control's `render` prop.
export const TextAreaProps = z
	.object({
		name: z.string().optional().describe('Submission key; usually inherited from the enclosing Field\'s name'),
		placeholder: z.string().optional().describe('Placeholder shown when empty'),
		rows: z.number().optional().describe('Visible rows before scrolling; defaults to 4'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		required: z.boolean().optional().describe('Marks the field required for native constraint validation'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'TextArea' });
export type TextAreaProps = z.infer<typeof TextAreaProps>;
