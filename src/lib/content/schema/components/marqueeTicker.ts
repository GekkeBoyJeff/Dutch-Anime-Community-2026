import { z } from 'zod';

// One item scrolling across the ticker.
export const MarqueeItem = z
	.object({
		label: z.string().min(1).describe('The text shown for this item'),
		icon: z.string().optional().describe('Optional leading icon glyph name (see the $icons map)'),
	})
	.meta({ title: 'MarqueeItem' });
export type MarqueeItem = z.infer<typeof MarqueeItem>;

// Props for the MarqueeTicker component: an infinite horizontal ticker of label (+ optional icon) items.
export const MarqueeTickerProps = z
	.object({
		items: z.array(MarqueeItem).describe('The items that scroll across, in order'),
		speed: z.number().optional().describe('Seconds for one full loop; lower is faster; defaults to 30'),
		direction: z.enum(['left', 'right']).optional().describe('Scroll direction; defaults to \'left\''),
		variant: z.enum(['primary', 'dark', 'light']).optional().describe('Visual treatment of the strip; defaults to \'primary\''),
		'aria-label': z.string().optional().describe('Accessible label for the whole strip; defaults to \'Scrolling announcements\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'MarqueeTicker' });
export type MarqueeTickerProps = z.infer<typeof MarqueeTickerProps>;
