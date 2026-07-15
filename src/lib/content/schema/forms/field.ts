import { z } from 'zod';

// Props for the Field component: the per-field wrapper that owns the a11y plumbing (id, htmlFor, aria-describedby, aria-invalid) for a label + control + description + error group.
export const FieldProps = z
	.object({
		name: z.string().optional().describe('Submission key; links the control to a <Form> and to server errors'),
		orientation: z.enum(['vertical', 'horizontal']).optional().describe('Layout for this row; defaults to the enclosing FieldSet\'s orientation, else vertical'),
		disabled: z.boolean().optional().describe('Disables this field\'s control'),
		invalid: z.boolean().optional().describe('Force the error/invalid state (e.g. when react-hook-form owns validation)'),
		validationMode: z.enum(['onSubmit', 'onBlur', 'onChange']).optional().describe('When to run validation for this field'),
		validationDebounceTime: z.number().optional().describe('Debounce in ms for an onChange async validate'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Field' });
export type FieldProps = z.infer<typeof FieldProps>;
