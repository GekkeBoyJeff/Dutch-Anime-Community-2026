import type { ReactNode } from 'react';
import { z } from 'zod';

import { TabItem, TabsProps } from '@/lib/site/content/schema/components/tabs';

export const DetailTab = TabItem.extend({
	panel: z.custom<ReactNode>().describe('The panel body shown while this tab is active'),
}).meta({ title: 'DetailTab' });
export type DetailTab = z.infer<typeof DetailTab>;

export const DetailTabsProps = TabsProps.omit({ items: true, panels: true })
	.extend({
		tabs: z.array(DetailTab).describe('The tabs, each carrying its own panel'),
	})
	.meta({ title: 'DetailTabs' });
export type DetailTabsProps = z.infer<typeof DetailTabsProps>;
