import type { ReactNode, Ref } from 'react';
import { z } from 'zod';

export const FieldGroupProps = z
	.object({
		className: z.string().optional().describe('Additional classes on the root element'),
		children: z.custom<ReactNode>().optional().describe('Stacked Field rows'),
		ref: z.custom<Ref<HTMLDivElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'FieldGroup' });
export type FieldGroupProps = z.infer<typeof FieldGroupProps>;
