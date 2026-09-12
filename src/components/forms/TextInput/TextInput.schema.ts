import type { ComponentPropsWithoutRef, Ref } from 'react';
import { z } from 'zod';

export const TextInputProps = z
	.object({
		name: z.string().optional().describe('Submission key; usually inherited from the enclosing Field\'s name'),
		type: z.string().optional().describe('The input type (text, email, password, tel, url, search, number, …)'),
		placeholder: z.string().optional().describe('Placeholder shown when empty'),
		disabled: z.boolean().optional().describe('Blocks interaction and dims the control'),
		required: z.boolean().optional().describe('Marks the field required for native constraint validation'),
		className: z.string().optional().describe('Additional classes on the root element'),
		ref: z.custom<Ref<HTMLInputElement>>().optional().describe('Ref to the underlying <input>'),
	})
	.meta({ title: 'TextInput' });
export type TextInputProps = z.infer<typeof TextInputProps> & ComponentPropsWithoutRef<'input'> & { children?: never };
