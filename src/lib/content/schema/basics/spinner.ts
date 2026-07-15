import { z } from 'zod';

export const SpinnerProps = z
	.object({
		size: z.enum(['s', 'm', 'l']).optional().describe('Diameter preset; defaults to \'m\''),
		label: z.string().optional().describe('Accessible label announced to screen readers; defaults to \'Loading\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Spinner' });
export type SpinnerProps = z.infer<typeof SpinnerProps>;
