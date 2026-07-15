import { z } from 'zod';

// Linear progress bar with role="progressbar". With a `value` it is determinate (fills to value/max);
// without one it is indeterminate (a sliding sweep, gated by prefers-reduced-motion).
export const ProgressProps = z
	.object({
		value: z.number().optional().describe('Current value (0–max); omit for an indeterminate bar'),
		max: z.number().optional().describe('Maximum value; defaults to 100'),
		label: z.string().optional().describe('Accessible label'),
		size: z.enum(['s', 'm', 'l']).optional().describe('Track thickness preset; defaults to m'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Progress' });
export type ProgressProps = z.infer<typeof ProgressProps>;
