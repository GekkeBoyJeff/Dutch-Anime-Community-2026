import { z } from 'zod';

export const BadgeProps = z
	.object({
		value: z.string().min(1).describe('The badge\'s visible text'),
		variant: z
			.enum(['neutral', 'primary', 'info', 'success', 'warning', 'error', 'outline'])
			.optional()
			.describe('Visual variant; tints the chip via the colorset/status tokens; defaults to neutral'),
		icon: z.string().optional().describe('Optional leading icon glyph name (see the ICONS map)'),
		dot: z.boolean().optional().describe('Shows a small leading status dot; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Badge' });
export type BadgeProps = z.infer<typeof BadgeProps>;
