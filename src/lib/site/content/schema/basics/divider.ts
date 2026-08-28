import { z } from 'zod';

export const DividerProps = z
	.object({
		orientation: z.enum(['horizontal', 'vertical']).optional().describe('Layout direction; defaults to horizontal'),
		label: z.string().optional().describe('Optional centered label (horizontal only), e.g. "or"'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Divider' });
export type DividerProps = z.infer<typeof DividerProps>;
