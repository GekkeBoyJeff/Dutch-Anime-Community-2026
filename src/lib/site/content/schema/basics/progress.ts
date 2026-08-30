import { z } from 'zod';

export const ProgressProps = z
	.object({
		value: z.number().optional().describe('Current value (0–max); omit for an indeterminate bar'),
		max: z.number().optional().describe('Maximum value; defaults to 100'),
		ariaLabel: z.string().optional().describe('Accessible label'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Progress' });
export type ProgressProps = z.infer<typeof ProgressProps>;
