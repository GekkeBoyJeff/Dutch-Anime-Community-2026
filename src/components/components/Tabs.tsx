'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/shared/classNames';
import type { TabsProps as TabsSchemaProps } from '@/lib/site/content/schema/components/tabs';

type TabsProps = TabsSchemaProps;

const Tabs = ({
	value,
	defaultValue = 0,
	items,
	panels = [],
	orientation = 'horizontal',
	activateOnFocus = false,
	ariaLabel,
	onValueChange,
	className,
}: TabsProps) => {
	return (
		<BaseTabs.Root
			className={classNames('tabs', className)}
			value={value}
			defaultValue={defaultValue}
			orientation={orientation}
			onValueChange={(next) => onValueChange?.(next as number)}
		>
			<BaseTabs.List className="tabs-list" activateOnFocus={activateOnFocus} aria-label={ariaLabel}>
				{items.map((item, index) => (
					<BaseTabs.Tab key={index} className="tabs-tab" value={index} disabled={item.disabled}>
						{item.icon && <Icon name={item.icon} className='tabs-tab-icon' />}
						<Content element="span" className="tabs-label" value={item.label} />
					</BaseTabs.Tab>
				))}

				<BaseTabs.Indicator className="tabs-indicator" renderBeforeHydration />
			</BaseTabs.List>

			{panels.map((panel, index) => (
				<BaseTabs.Panel key={index} className="tabs-panel" value={index}>
					{panel}
				</BaseTabs.Panel>
			))}
		</BaseTabs.Root>
	);
};

export default Tabs;
