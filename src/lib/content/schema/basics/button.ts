import { z } from 'zod';

import { InteractiveProps } from '@/lib/content/schema/basics/interactive';

// The one CTA face of the system. Interactive keeps the element honest (<button>, next/link or <a>,
// picked from `url`); Button adds the visual variant and the optional trailing icon — inline
// ('plain') or the circular badge that nudges its glyph on hover ('badge').
export const ButtonProps = InteractiveProps.extend({
	variant: z.enum(['primary', 'secondary', 'ghost']).optional().describe('Visual variant; primary always carries the brand colour; defaults to primary'),
	icon: z.string().optional().describe('Icon name rendered after the label').meta({ editor: 'icon' }),
	iconStyle: z.enum(['plain', 'badge']).optional().describe('How the icon renders: plain = inline glyph after the label; badge = circular chip that nudges the glyph on hover; defaults to plain'),
}).meta({ title: 'Button' });
export type ButtonProps = z.infer<typeof ButtonProps>;
