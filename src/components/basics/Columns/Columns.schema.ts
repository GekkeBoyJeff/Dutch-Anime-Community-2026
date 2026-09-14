import type { ReactNode } from 'react';
import { z } from 'zod';

export const ColumnsProps = z
	.object({
		gap: z.enum(['none', 's', 'm', 'l', 'xl']).optional().describe('Space between the cells, and between rows when they stack'),
		children: z.custom<ReactNode>().optional().describe('The Column cells in this row'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Columns' });
export type ColumnsProps = z.infer<typeof ColumnsProps>;
