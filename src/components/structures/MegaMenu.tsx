'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useRef, useState, type ReactNode, type Ref } from 'react';

import Avatar from '@/components/basics/Avatar';
import Badge from '@/components/basics/Badge';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import useOverlay from '@/hooks/useOverlay';
import { classNames } from '@/lib/classNames';

export interface MegaMenuLink {
	key: string;
	label: string;
	description: string;
	href: string;
	icon: string;
	/** Extra routes that should count as active for this link (e.g. a detail route reached from it). */
	activeHrefs?: string[];
}

export interface MegaMenuGroup {
	key: string;
	label: string;
	description: string;
	links: MegaMenuLink[];
	/** Optional highlight column rendered on the panel's right; nothing shows when omitted. */
	highlight?: ReactNode;
}

export interface MegaMenuUser {
	name: string;
	roleLabel?: string;
	avatarUrl?: string;
	initials?: string;
}

interface MegaMenuProps {
	groups: MegaMenuGroup[];
	brand?: { title: string; src?: string };
	/** The bar's home link (the dashboard hub); active on its exact route. */
	home?: { label: string; href: string };
	user?: MegaMenuUser;
	/** The "Terug naar de website" affordance. */
	backLink?: { label: string; href: string };
	className?: string;
	ref?: Ref<HTMLElement>;
	/** Controls the mobile overlay from outside (e.g. a "Meer" tab). Omit to keep it self-contained. */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

// A link is active on its exact route and on any route nested below it (so /dashboard/inventory keeps
// its group lit on a detail page). Only same-app paths ever match. Exported so other mobile nav surfaces
// (BottomTabBar) apply the identical active-route logic.
export const isActivePath = (pathname: string, href: string, exact = false): boolean => {
	if (!href.startsWith('/')) return false;
	if (exact) return pathname === href;
	return pathname === href || pathname.startsWith(`${href}/`);
};

// A link is also active on any of its `activeHrefs` — detail routes reached from it that don't nest
// under its own href (e.g. the event editor doesn't live under /dashboard/inventory).
const isLinkActive = (pathname: string, link: MegaMenuLink): boolean =>
	isActivePath(pathname, link.href) || (link.activeHrefs ?? []).some((href) => isActivePath(pathname, href));

// One panel link: icon + label + description, routed through next/link for client-side navigation and
// closing the panel on click. Base UI's Link owns the a11y/keyboard wiring; `active` marks the page.
const PanelLink = ({ link, active }: { link: MegaMenuLink; active: boolean }) => (
	<NavigationMenu.Link
		className={classNames('mega-menu-link', active && 'is-active')}
		active={active}
		closeOnClick
		render={<NextLink href={link.href} />}
	>
		<span className="mega-menu-link-icon" aria-hidden="true">
			<Icon name={link.icon} />
		</span>
		<span className="mega-menu-link-text">
			<span className="mega-menu-link-label">{link.label}</span>
			<span className="mega-menu-link-description">{link.description}</span>
		</span>
	</NavigationMenu.Link>
);

// The dropdown panel for one group: a group-intro card on the left, the link list in the middle, and an
// optional highlight column on the right (rendered only when the group supplies one).
const MegaMenuPanel = ({ group, pathname }: { group: MegaMenuGroup; pathname: string }) => (
	<div className={classNames('mega-menu-panel', Boolean(group.highlight) && 'has-highlight')}>
		<div className="mega-menu-intro">
			<span className="mega-menu-intro-label">{group.label}</span>
			<span className="mega-menu-intro-description">{group.description}</span>
		</div>
		<ul className="mega-menu-link-list">
			{group.links.map((link) => (
				<li key={link.key}>
					<PanelLink link={link} active={isLinkActive(pathname, link)} />
				</li>
			))}
		</ul>
		{group.highlight && <div className="mega-menu-highlight">{group.highlight}</div>}
	</div>
);

// The admin top bar: a brand, the group triggers on Base UI Navigation Menu (click-to-open — hover opens
// are ignored so it reads like a tool, not a marketing header), and a user/role chip plus the back link
// on the right. On small screens the triggers collapse into a group-sectioned overlay with a focus trap.
const MegaMenu = ({ groups, brand, home, user, backLink, className, ref, open: openProp, onOpenChange }: MegaMenuProps) => {
	const pathname = usePathname();
	const [value, setValue] = useState<string | null>(null);
	const [internalOpen, setInternalOpen] = useState(false);
	const [seenPath, setSeenPath] = useState(pathname);
	const rootRef = useRef<HTMLElement | null>(null);

	// Controlled/uncontrolled: an external open+onOpenChange (e.g. BottomTabBar's "Meer" tab) drives the
	// same overlay; otherwise it manages its own state as before.
	const open = openProp ?? internalOpen;
	const setOpen = useCallback(
		(next: boolean) => {
			if (openProp === undefined) setInternalOpen(next);
			onOpenChange?.(next);
		},
		[openProp, onOpenChange],
	);

	// Close the desktop panel on navigation (reset-on-prop-change, no extra effect). Only the locally-
	// owned `internalOpen` resets here — calling `onOpenChange` here would set DashboardNav's state
	// during MegaMenu's render, which React forbids. DashboardNav closes its own `menuOpen` the same way.
	if (pathname !== seenPath) {
		setSeenPath(pathname);
		setValue(null);
		if (openProp === undefined) setInternalOpen(false);
	}

	useOverlay(open, () => setOpen(false));

	// While the overlay is open, trap Tab within the header and restore focus to the trigger on close —
	// the page behind stays in the DOM but is unreachable by keyboard, matching what the eye sees.
	useEffect(() => {
		const root = rootRef.current;
		if (!open || !root) return;

		const previous = document.activeElement as HTMLElement | null;
		root.querySelector<HTMLElement>('.mega-menu-overlay a')?.focus();

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') {
				setOpen(false);
				return;
			}
			if (event.key !== 'Tab') return;

			const focusables = Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter(
				(element) => element.offsetParent !== null,
			);
			if (focusables.length === 0) return;

			const first = focusables[0] as HTMLElement;
			const last = focusables[focusables.length - 1] as HTMLElement;
			const active = document.activeElement;

			if (event.shiftKey && (active === first || !root.contains(active))) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && (active === last || !root.contains(active))) {
				event.preventDefault();
				first.focus();
			}
		};

		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			previous?.focus();
		};
	}, [open, setOpen]);

	const homeActive = home ? isActivePath(pathname, home.href, true) : false;

	const userChip = user && (
		<span className="mega-menu-user">
			<Avatar size="s" src={user.avatarUrl} initials={user.initials} alt="" />
			<span className="mega-menu-user-text">
				<span className="mega-menu-user-name">{user.name}</span>
				{user.roleLabel && (
					<Badge variant="primary" className="mega-menu-user-role">
						{user.roleLabel}
					</Badge>
				)}
			</span>
		</span>
	);

	return (
		<header
			ref={(element) => {
				rootRef.current = element;
				if (typeof ref === 'function') ref(element);
				else if (ref) ref.current = element;
			}}
			className={classNames('mega-menu', open && 'is-open', className)}
		>
			<div className="mega-menu-bar">
				{brand && (
					<Interactive url={home?.href ?? '/dashboard'} className="mega-menu-brand" aria-label={brand.title}>
						{brand.src && <Media variant="plain" type="image" src={brand.src} alt="" width={40} height={40} className="mega-menu-logo" />}
						<span className="mega-menu-wordmark">{brand.title}</span>
					</Interactive>
				)}

				<NavigationMenu.Root
					className="mega-menu-nav"
					aria-label="Beheer"
					value={value}
					onValueChange={(next, details) => {
						// Click-to-open only: drop hover-driven changes so panels open on press, not on pass-over.
						if (details.reason === 'trigger-hover') return;
						setValue(next);
					}}
				>
					<NavigationMenu.List className="mega-menu-triggers">
						{home && (
							<li className="mega-menu-home">
								<Interactive
									url={home.href}
									className={classNames('mega-menu-home-link', homeActive && 'is-active')}
									aria-current={homeActive ? 'page' : undefined}
								>
									{home.label}
								</Interactive>
							</li>
						)}
						{groups.map((group) => {
							const active = group.links.some((link) => isLinkActive(pathname, link));
							return (
								<NavigationMenu.Item key={group.key} value={group.key}>
									<NavigationMenu.Trigger className={classNames('mega-menu-trigger', active && 'is-active')}>
										{group.label}
										<Icon name="chevron-down" className="mega-menu-chevron" />
									</NavigationMenu.Trigger>
									<NavigationMenu.Content className="mega-menu-content">
										<MegaMenuPanel group={group} pathname={pathname} />
									</NavigationMenu.Content>
								</NavigationMenu.Item>
							);
						})}
					</NavigationMenu.List>

					<NavigationMenu.Portal>
						<NavigationMenu.Positioner
							className="mega-menu-positioner"
							data-theme="admin"
							data-colorset="light"
							positionMethod="fixed"
							side="bottom"
							align="start"
							sideOffset={8}
							collisionPadding={16}
						>
							<NavigationMenu.Popup className="mega-menu-popup">
								<NavigationMenu.Viewport className="mega-menu-viewport" />
							</NavigationMenu.Popup>
						</NavigationMenu.Positioner>
					</NavigationMenu.Portal>
				</NavigationMenu.Root>

				<div className="mega-menu-side">
					{userChip}
					{backLink && (
						<Interactive url={backLink.href} target="_self" className="mega-menu-back">
							<Icon name="external" />
							<span>{backLink.label}</span>
						</Interactive>
					)}
					<Interactive
						className="mega-menu-toggle"
						aria-expanded={open}
						aria-label={open ? 'Sluit menu' : 'Open menu'}
						onClick={() => setOpen(!open)}
					>
						<Icon name={open ? 'close' : 'menu'} />
					</Interactive>
				</div>
			</div>

			<div className="mega-menu-scrim" aria-hidden="true" onClick={() => setOpen(false)} />
			<div className="mega-menu-overlay" aria-hidden={!open} inert={!open}>
				<nav aria-label="Beheer (mobiel)">
					{home && (
						<Interactive
							url={home.href}
							onClick={() => setOpen(false)}
							className={classNames('mega-menu-overlay-home', homeActive && 'is-active')}
							aria-current={homeActive ? 'page' : undefined}
						>
							{home.label}
						</Interactive>
					)}
					{groups.map((group) => (
						<section key={group.key} className="mega-menu-overlay-group">
							<Content element="h2" className="mega-menu-overlay-heading" value={group.label} />
							<ul>
								{group.links.map((link) => {
									const active = isLinkActive(pathname, link);
									return (
										<li key={link.key}>
											<Interactive
												url={link.href}
												onClick={() => setOpen(false)}
												className={classNames('mega-menu-overlay-link', active && 'is-active')}
												aria-current={active ? 'page' : undefined}
											>
												<Icon name={link.icon} />
												{link.label}
											</Interactive>
										</li>
									);
								})}
							</ul>
						</section>
					))}
					{backLink && (
						<Interactive url={backLink.href} target="_self" onClick={() => setOpen(false)} className="mega-menu-overlay-back">
							<Icon name="external" />
							{backLink.label}
						</Interactive>
					)}
				</nav>
			</div>
		</header>
	);
};

export default MegaMenu;
