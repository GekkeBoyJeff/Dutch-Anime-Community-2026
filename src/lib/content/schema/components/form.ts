import { z } from 'zod';

export const FormProps = z
	.object({
		validateOn: z
			.enum(['blur', 'input', 'submit'])
			.optional()
			.describe('When validation runs; defaults to \'submit\''),
		resetOnSuccess: z
			.boolean()
			.optional()
			.describe('Reset the fields to initialValues after a successful submit; defaults to false'),
		className: z.string().optional().describe('Additional classes on the <form> element'),
	})
	.meta({ title: 'Form' });

export type FormProps = z.infer<typeof FormProps>;
