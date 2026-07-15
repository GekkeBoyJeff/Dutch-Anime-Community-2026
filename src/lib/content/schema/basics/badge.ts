import { z } from 'zod';

// Static status/label chip's props. Its 7-value variant enum (includes 'outline') is not the shared
// StatusVariant primitive (6 values), so it stays a local z.enum here.
export const BadgeProps = z
	.object({
		variant: z
			.enum(['neutral', 'primary', 'info', 'success', 'warning', 'error', 'outline'])
			.optional()
			.describe('Visual variant; tints the chip via the colorset/status tokens; defaults to neutral'),
		icon: z.string().optional().describe('Optional leading icon glyph name (see the $icons map)'),
		dot: z.boolean().optional().describe('Shows a small leading status dot; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Badge' });
export type BadgeProps = z.infer<typeof BadgeProps>;
