import type { ReactNode, Ref } from 'react';
import { z } from 'zod';

export const FieldProps = z
	.object({
		name: z.string().optional().describe('Submission key; links the control to a <Form> and to server errors'),
		orientation: z.enum(['vertical', 'horizontal']).optional().describe('Layout for this row; defaults to the enclosing FieldSet\'s orientation, else vertical'),
		disabled: z.boolean().optional().describe('Disables this field\'s control'),
		invalid: z.boolean().optional().describe('Force the error/invalid state (e.g. when react-hook-form owns validation)'),
		validate: z
			.custom<(value: unknown, formValues: Record<string, unknown>) => string | string[] | null | Promise<string | string[] | null>>()
			.optional()
			.describe('Custom (a)sync validator; return message(s) when invalid or null when valid'),
		validationMode: z.enum(['onSubmit', 'onBlur', 'onChange']).optional().describe('When to run validation for this field'),
		validationDebounceTime: z.number().optional().describe('Debounce in ms for an onChange async validate'),
		className: z.string().optional().describe('Additional classes on the root element'),
		children: z.custom<ReactNode>().optional().describe('Label + Control + Description + Error'),
		ref: z.custom<Ref<HTMLDivElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'Field' });
export type FieldProps = z.infer<typeof FieldProps>;
