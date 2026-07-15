import { z } from 'zod';

// Notification badge dot/count mark. Its 4-value variant enum is a local set, not the shared StatusVariant primitive.
export const IndicatorProps = z
	.object({
		count: z.number().optional().describe('A numeric count; omit for a plain dot. 0 hides the mark unless `showZero`'),
		position: z
			.enum(['top-end', 'top-start', 'bottom-end', 'bottom-start'])
			.optional()
			.describe('Corner the mark is anchored to; defaults to top-end'),
		variant: z
			.enum(['primary', 'success', 'warning', 'error'])
			.optional()
			.describe('Mark colour; defaults to primary'),
		showZero: z.boolean().optional().describe('Keep showing when count is 0'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Indicator' });
export type IndicatorProps = z.infer<typeof IndicatorProps>;
