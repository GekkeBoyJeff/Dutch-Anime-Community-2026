import type { ReactNode, Ref } from 'react';
import { z } from 'zod';

export const FieldLabelProps = z
	.object({
		htmlFor: z.string().optional().describe('Explicit target id; omit to auto-wire to the field\'s control'),
		nativeLabel: z.boolean().optional().describe('Render a non-<label> element (e.g. a div); set false so it stops behaving like a label'),
		className: z.string().optional().describe('Additional classes on the root element'),
		children: z.custom<ReactNode>().optional().describe('The label text'),
		ref: z.custom<Ref<HTMLLabelElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'FieldLabel' });
export type FieldLabelProps = z.infer<typeof FieldLabelProps>;
