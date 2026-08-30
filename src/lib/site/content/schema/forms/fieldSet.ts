import type { ReactNode, Ref } from 'react';
import { z } from 'zod';

export const FieldSetProps = z
	.object({
		orientation: z.enum(['vertical', 'horizontal']).optional().describe('Layout context inherited by child Fields; defaults to \'vertical\''),
		disabled: z.boolean().optional().describe('Disables every control in the group via the native <fieldset disabled>'),
		className: z.string().optional().describe('Additional classes on the root element'),
		children: z.custom<ReactNode>().optional().describe('A FieldLegend followed by Fields'),
		ref: z.custom<Ref<HTMLFieldSetElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'FieldSet' });
export type FieldSetProps = z.infer<typeof FieldSetProps>;
