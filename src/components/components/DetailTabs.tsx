'use client';

import type { ReactNode } from 'react';

import Tabs from '@/components/components/Tabs';
import type { TabItem } from '@/lib/content/schema/components/tabs';

export type DetailTab = TabItem & {
	/** The panel shown when this tab is active */
	panel: ReactNode;
};

type DetailTabsProps = {
	/** Tabs paired with their panels in one list (no parallel-array index footgun) */
	tabs: DetailTab[];
	/** Active tab index (controlled) */
	value?: number;
	/** Initial active index when uncontrolled; defaults to 0 */
	defaultValue?: number;
	orientation?: 'horizontal' | 'vertical';
	activateOnFocus?: boolean;
	/** Accessible name for the tab strip */
	label?: string;
	onValueChange?: (value: number) => void;
	className?: string;
};

// Wraps Tabs to collapse its two index-matched arrays (items + panels) into one list of {...item, panel}
// entries — removing the item[i] ↔ panel[i] mismatch footgun while keeping Base UI's numeric-index model.
const DetailTabs = ({ tabs, ...rest }: DetailTabsProps) => {
	const items = tabs.map((tab): TabItem => ({ label: tab.label, icon: tab.icon, disabled: tab.disabled }));
	const panels = tabs.map((tab) => tab.panel);
	return <Tabs items={items} panels={panels} {...rest} />;
};

export default DetailTabs;
