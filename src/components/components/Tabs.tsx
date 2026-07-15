'use client';

import { Tabs as BaseTabs } from '@base-ui/react/tabs';
import type { ReactNode, Ref } from 'react';

import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import type { TabsProps as TabsSchemaProps } from '@/lib/content/schema/components/tabs';

type TabsProps = TabsSchemaProps & {
	/** The panel content per tab, indexed the same as `items` */
	panels?: ReactNode[];
	/** Fires with the new active index whenever the selection changes */
	onValueChange?: (value: number) => void;
};

// A token-styled wrapper over Base UI Tabs: it already ships the APG roving-tabindex, keyboard
// navigation and Tab↔Panel id wiring, so we only map our flat index-based props onto its parts and
// draw the sliding indicator from the CSS vars it exposes. A small client island; the page around
// it stays a Server Component.
const Tabs = ({
	value,
	defaultValue = 0,
	items,
	panels = [],
	orientation = 'horizontal',
	activateOnFocus = false,
	label,
	onValueChange,
	className,
	ref,
}: TabsProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<BaseTabs.Root
			ref={ref}
			className={classNames('tabs', className)}
			value={value}
			defaultValue={defaultValue}
			orientation={orientation}
			onValueChange={(next) => onValueChange?.(next as number)}
		>
			<BaseTabs.List className="list" activateOnFocus={activateOnFocus} aria-label={label}>
				{items.map((item, index) => (
					<BaseTabs.Tab key={index} className="tab" value={index} disabled={item.disabled}>
						{item.icon && <Icon name={item.icon} className='tabs-tab-icon' />}
						<Content element="span" className="label" value={item.label} />
					</BaseTabs.Tab>
				))}

				<BaseTabs.Indicator className="indicator" renderBeforeHydration />
			</BaseTabs.List>

			{panels.map((panel, index) => (
				<BaseTabs.Panel key={index} className="panel" value={index}>
					{panel}
				</BaseTabs.Panel>
			))}
		</BaseTabs.Root>
	);
};

export default Tabs;
