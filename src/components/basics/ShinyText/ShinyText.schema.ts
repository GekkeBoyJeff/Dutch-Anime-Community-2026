import { z } from 'zod';

export const ShinyTextProps = z
	.object({
		value: z.string().optional().describe('The text; may contain HTML'),
		speed: z.enum(['slow', 'normal', 'fast']).optional().describe('Pace of the shine sweep; defaults to normal'),
		disabled: z.boolean().optional().describe('Renders plain text with no animated shine'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'ShinyText' });
export type ShinyTextProps = z.infer<typeof ShinyTextProps>;
