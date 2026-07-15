import { z } from 'zod';

// Props for FieldLegend: the accessible name for a FieldSet.
export const FieldLegendProps = z
	.object({
		variant: z
			.enum(['legend', 'label'])
			.optional()
			.describe(
				"Large group title vs label-sized name for a single grouped control (radio/checkbox set); defaults to 'legend'"
			),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'FieldLegend' });
export type FieldLegendProps = z.infer<typeof FieldLegendProps>;
