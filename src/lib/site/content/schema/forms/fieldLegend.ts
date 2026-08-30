import type { ReactNode, Ref } from 'react';
import { z } from 'zod';

export const FieldLegendProps = z
	.object({
		variant: z
			.enum(['legend', 'label'])
			.optional()
			.describe(
				"Large group title vs label-sized name for a single grouped control (radio/checkbox set); defaults to 'legend'"
			),
		className: z.string().optional().describe('Additional classes on the root element'),
		children: z.custom<ReactNode>().optional().describe('The group name'),
		ref: z.custom<Ref<HTMLDivElement>>().optional().describe('Ref to the root element'),
	})
	.meta({ title: 'FieldLegend' });
export type FieldLegendProps = z.infer<typeof FieldLegendProps>;
