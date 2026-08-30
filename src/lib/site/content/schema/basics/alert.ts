import { z } from 'zod';

export const AlertProps = z
	.object({
		variant: z
			.enum(['info', 'success', 'warning', 'error', 'neutral'])
			.optional()
			.describe('Severity; drives the colour and the ARIA role (alert for warning/error, else status); defaults to info'),
		title: z.string().optional().describe('Optional bold title above the body'),
		icon: z.string().optional().describe('Optional leading icon glyph name'),
		className: z.string().optional().describe('Additional classes on the root element'),
		value: z.string().optional().describe('The message text under the title; plain text, not parsed as HTML'),
	})
	.meta({ title: 'Alert' });
export type AlertProps = z.infer<typeof AlertProps>;
