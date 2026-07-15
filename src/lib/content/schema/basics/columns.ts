import { z } from 'zod';

export const ColumnsProps = z
	.object({
		align: z.enum(['start', 'center', 'end', 'stretch', 'baseline']).optional().describe('Vertical alignment of the columns'),
		gap: z.enum(['none', 's', 'm', 'l', 'xl']).optional().describe('Gap between columns'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Columns' });
export type ColumnsProps = z.infer<typeof ColumnsProps>;
