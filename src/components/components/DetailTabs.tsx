'use client';

import Tabs from '@/components/components/Tabs';
import type { DetailTab, DetailTabsProps as DetailTabsSchemaProps } from '@/lib/site/content/schema/components/detailTabs';
import type { TabItem } from '@/lib/site/content/schema/components/tabs';

export type { DetailTab };

type DetailTabsProps = DetailTabsSchemaProps;

const DetailTabs = ({
	tabs,
	...rest
}: DetailTabsProps) => {
	const items = tabs.map((tab): TabItem => ({ label: tab.label, icon: tab.icon, disabled: tab.disabled }));
	const panels = tabs.map((tab) => tab.panel);
	return <Tabs items={items} panels={panels} {...rest} />;
};

export default DetailTabs;
