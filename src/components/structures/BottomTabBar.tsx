'use client';

import { usePathname } from 'next/navigation';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import { isActivePath } from '@/components/structures/MegaMenu';
import { classNames } from '@/lib/classNames';

export interface BottomTabBarItem {
	key: string;
	label: string;
	href: string;
	icon: string;
	/** Active only on the exact route (e.g. the dashboard home), not on nested routes below it. */
	exact?: boolean;
}

export interface BottomTabBarMoreItem {
	label: string;
	icon: string;
	onClick: () => void;
	active?: boolean;
}

interface BottomTabBarProps {
	items: BottomTabBarItem[];
	/** Opens the MegaMenu mobile overlay (lifted state, controlled by the caller). Omit to hide the tab. */
	more?: BottomTabBarMoreItem;
	className?: string;
}

// Fixed bottom tab bar for the primary mobile "field" destinations, shown only below the `l` breakpoint —
// the same cutoff where MegaMenu's overlay takes over. "Meer" reuses that overlay rather than duplicating it.
const BottomTabBar = ({ items, more, className }: BottomTabBarProps) => {
	const pathname = usePathname();

	return (
		<nav className={classNames('bottom-tab-bar', className)} aria-label="Beheer (snelmenu)">
			{items.map((item) => {
				const active = isActivePath(pathname, item.href, item.exact);
				return (
					<Interactive
						key={item.key}
						url={item.href}
						className={classNames('bottom-tab-bar-tab', active && 'is-active')}
						aria-current={active ? 'page' : undefined}
					>
						<Icon name={item.icon} />
						<span>{item.label}</span>
					</Interactive>
				);
			})}
			{more && (
				<Interactive
					className={classNames('bottom-tab-bar-tab', more.active && 'is-active')}
					aria-expanded={more.active}
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
