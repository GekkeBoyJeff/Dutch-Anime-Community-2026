'use client';

import { usePathname } from 'next/navigation';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import { isActivePath } from '@/components/structures/Navigation';
import { classNames } from '@/lib/shared/classNames';

export interface BottomTabBarItem {
	key: string;
	label: string;
	href: string;
	icon: string;
	exact?: boolean;
}

interface BottomTabBarMoreItem {
	label: string;
	icon: string;
	onClick: () => void;
	active?: boolean;
}

interface BottomTabBarProps {
	items: BottomTabBarItem[];
	more?: BottomTabBarMoreItem;
}

const BottomTabBar = ({ items, more }: BottomTabBarProps) => {
	const pathname = usePathname();

	return (
		<nav className="bottom-tab-bar" aria-label="Beheer (snelmenu)">
			{items.map((item) => {
				const active = isActivePath(pathname, item.href, item.exact);
				return (
					<Interactive
						key={item.key}
						url={item.href}
						className={classNames('bottom-tab-bar-tab', active && 'is-active')}
						ariaCurrent={active ? 'page' : undefined}
					>
						<Icon name={item.icon} />
						<span>{item.label}</span>
					</Interactive>
				);
			})}
			{more && (
				<Interactive
					className={classNames('bottom-tab-bar-tab', more.active && 'is-active')}
					ariaExpanded={more.active}
					onClick={more.onClick}
				>
					<Icon name={more.icon} />
					<span>{more.label}</span>
				</Interactive>
			)}
		</nav>
	);
};

export default BottomTabBar;
