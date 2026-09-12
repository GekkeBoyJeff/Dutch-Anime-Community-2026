'use client';

import Tabs from '@/components/components/Tabs/Tabs';
import type { TabItem } from '@/components/components/Tabs/Tabs.schema';

import type { DetailTab, DetailTabsProps as DetailTabsSchemaProps } from './DetailTabs.schema';

export type { DetailTab };

type DetailTabsProps = DetailTabsSchemaProps;

const DetailTabs = ({
	tabs,
	...rest
}: DetailTabsProps) => {
	const items = tabs.map((tab): TabItem => ({
		label: tab.label,
		icon: tab.icon,
		disabled: tab.disabled,
	}));
	const panels = tabs.map((tab) => tab.panel);
	return <Tabs items={items} panels={panels} {...rest} />;
};

export default DetailTabs;
