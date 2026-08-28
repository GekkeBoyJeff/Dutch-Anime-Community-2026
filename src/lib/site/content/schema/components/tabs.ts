import type { ReactNode } from 'react';
import { z } from 'zod';

export const TabItem = z
	.object({
		label: z.string().describe('The tab label; may contain HTML'),
		icon: z.string().optional().describe('Optional leading icon glyph name (see the $icons map)'),
		disabled: z.boolean().optional().describe('Greys out the tab and skips it during keyboard navigation'),
	})
	.meta({ title: 'TabItem' });
export type TabItem = z.infer<typeof TabItem>;

export const TabsProps = z
	.object({
		value: z.number().optional().describe('The active tab index (controlled); omit for uncontrolled'),
		defaultValue: z.number().optional().describe('The initial active tab index when uncontrolled; defaults to 0'),
		items: z.array(TabItem).describe('The tab strip: one entry per tab, matched to a panel by index'),
		panels: z.array(z.custom<ReactNode>()).optional().describe('The panel bodies, matched to a tab by index'),
		onValueChange: z.custom<(value: number) => void>().optional().describe('Fires with the newly active tab index'),
		orientation: z
			.enum(['horizontal', 'vertical'])
			.optional()
			.describe('Layout axis; vertical stacks the tabs beside the panels; defaults to \'horizontal\''),
		activateOnFocus: z
			.boolean()
			.optional()
			.describe('Selects on arrow focus (automatic) instead of on Enter/Space (manual); defaults to false'),
		ariaLabel: z.string().optional().describe('Accessible name for the tab strip (sets aria-label on the tablist)'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Tabs' });
export type TabsProps = z.infer<typeof TabsProps>;
