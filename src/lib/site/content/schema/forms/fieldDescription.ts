import type { ReactNode, Ref } from 'react';
import { z } from 'zod';

export const FieldDescriptionProps = z
	.object({
		className: z.string().optional().describe('Additional classes on the root element'),
		children: z.custom<ReactNode>().optional().describe('Helper text; its id is auto-merged into the control\'s aria-describedby'),
		ref: z.custom<Ref<HTMLParagraphElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'FieldDescription' });
export type FieldDescriptionProps = z.infer<typeof FieldDescriptionProps>;
