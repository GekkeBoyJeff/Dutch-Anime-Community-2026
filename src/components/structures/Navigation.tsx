'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

import Avatar from '@/components/basics/Avatar';
import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Menu from '@/components/components/Menu';
import useOverlay from '@/hooks/useOverlay';
import { signOut } from '@/lib/shared/auth/permissions';
import { classNames } from '@/lib/shared/classNames';
import type {
	DashboardNavigationProps as DashboardNavigationSchemaProps,
	MegaMenuGroup as MegaMenuGroupSchema,
	MegaMenuLink as MegaMenuLinkSchema,
	MegaMenuUser as MegaMenuUserSchema,
	NavCta as NavCtaSchema,
	NavigationProps as NavigationSchemaProps,
	NavItem as NavItemSchema,
} from '@/lib/site/content/schema/structures/navigation';

export type NavItem = NavItemSchema;

export type NavCta = NavCtaSchema;

export type MegaMenuLink = MegaMenuLinkSchema;

export type MegaMenuGroup = MegaMenuGroupSchema;

export type MegaMenuUser = MegaMenuUserSchema;

type NavigationProps = DashboardNavigationSchemaProps;

export const isActivePath = (pathname: string, url: string, exact = false): boolean => {
	if (!url.startsWith('/')) {
		return false;
	}
	if (exact || url === '/') {
		return pathname === url;
	}
	return pathname === url || pathname.startsWith(`${url}/`);
};

const isLinkActive = (pathname: string, link: MegaMenuLink): boolean =>
	isActivePath(pathname, link.href) || (link.activeHrefs ?? []).some((href) => isActivePath(pathname, href));

type GroupIndicatorProps = {
	group: MegaMenuGroup;
};

const GroupIndicator = ({
	group,
}: GroupIndicatorProps) => {
	if (group.badge && group.badge > 0) {
		return (
			<span className="mega-menu-badge" aria-label={`${group.badge} openstaand`}>
				{group.badge}
			</span>
		);
	}
	if (group.dot) return <span className="mega-menu-dot" aria-label="Er wacht iets" />;
	return null;
};

type PanelLinkProps = {
	link: MegaMenuLink;
	active: boolean;
};

const PanelLink = ({
	link,
	active,
}: PanelLinkProps) => (
	<NavigationMenu.Link className={classNames('mega-menu-link', active && 'is-active')} active={active} closeOnClick render={<NextLink href={link.href} />}>
		<span className="mega-menu-link-icon" aria-hidden="true">
			<Icon name={link.icon} />
		</span>
		<span className="mega-menu-link-text">
			<span className="mega-menu-link-label">{link.label}</span>
			<span className="mega-menu-link-description">{link.description}</span>
		</span>
	</NavigationMenu.Link>
);

type MegaPanelBodyProps = {
	group: MegaMenuGroup;
	pathname: string;
};

const MegaPanelBody = ({
	group,
	pathname,
}: MegaPanelBodyProps) => (
	<div className="mega-menu-panel">
		<ul className="mega-menu-link-list">
			{group.links.map((link) => (
				<li key={link.key}>
					<PanelLink link={link} active={isLinkActive(pathname, link)} />
				</li>
			))}
		</ul>
		{group.highlight && <div className="mega-menu-highlight-slot">{group.highlight}</div>}
	</div>
);

const useTracker = (deps: unknown[]) => {
	const listRef = useRef<HTMLElement | null>(null);
	const [tracker, setTracker] = useState<{ x: number; width: number } | null>(null);

	const measure = useCallback(() => {
		const list = listRef.current;
		if (!list) return;
		const target = list.querySelector<HTMLElement>('[data-popup-open]') ?? list.querySelector<HTMLElement>('.is-active');
		if (!target) {
			setTracker(null);
			return;
		}
		const listBox = list.getBoundingClientRect();
		const box = target.getBoundingClientRect();
		setTracker({ x: box.left - listBox.left, width: box.width });
	}, []);

	useLayoutEffect(() => {
		measure();
		window.addEventListener('resize', measure);
		return () => window.removeEventListener('resize', measure);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [measure, ...deps]);

	useEffect(() => {
		document.fonts?.ready.then(measure);
	}, [measure]);

	return { listRef, tracker };
};

type PublicHeaderProps = NavigationSchemaProps;

const PublicHeader = ({
	items = [],
	cta,
	brand,
	className,
}: PublicHeaderProps) => {
	const [open, setOpen] = useState(false);
	const pathname = usePathname();
	const [seenPath, setSeenPath] = useState(pathname);
	const rootRef = useRef<HTMLElement | null>(null);
	const { listRef, tracker } = useTracker([pathname]);

	// Close the overlay when the route changes so the new page is visible. Adjusting state during
	// render (React's reset-on-prop-change pattern) avoids an effect + cascading render.
	if (pathname !== seenPath) {
		setSeenPath(pathname);
		setOpen(false);
	}

	useOverlay(open, () => setOpen(false));

	// The page scrolls inside .page-frame, not the window, so Next's own scroll reset never reaches
	// it; scroll the frame back to the top on every navigation (window fallback covers Storybook).
	// Layout effect, not effect, so the scroll lands before the new page paints.
	useLayoutEffect(() => {
		const frame = rootRef.current?.closest('.page-frame-scroll');
		(frame ?? window).scrollTo({ top: 0, left: 0, behavior: 'instant' });
	}, [pathname]);

	useEffect(() => {
		const root = rootRef.current;
		if (!open || !root) {
			return;
		}

		const previous = document.activeElement as HTMLElement | null;
		root.querySelector<HTMLElement>('.navigation-overlay a')?.focus();

		const handleKeydown = (event: KeyboardEvent) => {
			if (event.key !== 'Tab') {
				return;
			}

			const focusables = Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((element) => element.offsetParent !== null);
			if (focusables.length === 0) {
				return;
			}

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
	}, [open]);

	const brandContent = (
		<>
			{brand?.src && <Media variant="plain" type="image" src={brand.src} alt="" width={48} height={48} className="navigation-logo" />}
			{brand?.title && <Content element="span" className="navigation-wordmark" value={brand.title} />}
		</>
	);

	return (
		<header ref={rootRef} className={classNames('navigation', open && 'is-open', className)}>
			<div className="navigation-bar">
				{brand?.interactive === false ? (
					<span className="navigation-brand">{brandContent}</span>
				) : (
					<Interactive url="/" className="navigation-brand" ariaLabel={brand?.title ?? 'Home'}>
						{brandContent}
					</Interactive>
				)}

				<nav className="navigation-pill" aria-label="Primary">
					<Interactive className="navigation-toggle" ariaExpanded={open} ariaLabel={open ? 'Sluit menu' : 'Open menu'} onClick={() => setOpen(!open)}>
						<span className="navigation-bars" aria-hidden="true" />
						<span className="navigation-toggle-label">Menu</span>
					</Interactive>

					{items.length > 0 && (
						<div className="navigation-links">
							<span
								className="navigation-tracker"
								aria-hidden="true"
								data-visible={tracker ? 'true' : undefined}
								style={tracker ? { transform: `translateX(${tracker.x}px)`, width: `${tracker.width}px` } : undefined}
							/>
							<ul ref={(element) => void (listRef.current = element)}>
								{items.map((item) => {
									const active = isActivePath(pathname, item.url, item.exact);
									return (
										<li key={item.url} className={active ? 'is-active' : undefined}>
											<Interactive url={item.url} target={item.target} className="navigation-link" ariaCurrent={active ? 'page' : undefined}>
												{item.label}
											</Interactive>
										</li>
									);
								})}
							</ul>
						</div>
					)}
				</nav>
			</div>

			{cta && (
				<div className="navigation-cta-tab">
					<span className="corner is-scoop-bl is-start" aria-hidden="true" />
					<Button url={cta.url} target={cta.target ?? '_blank'} variant={cta.variant ?? 'primary'} value={cta.label} className="navigation-cta" />
					<span className="corner is-scoop-bl is-end" aria-hidden="true" />
				</div>
			)}

			{items.length > 0 && (
				<>
					<div className="navigation-scrim" aria-hidden="true" onClick={() => setOpen(false)} />
					<div className="navigation-overlay" aria-hidden={!open} inert={!open}>
						<nav aria-label="Mobile">
							<ul>
								{items.map((item, index) => {
									const active = isActivePath(pathname, item.url, item.exact);
									return (
										<li key={item.url} className={active ? 'is-active' : undefined} style={{ '--index': index } as React.CSSProperties}>
											<Interactive
												url={item.url}
												target={item.target}
												onClick={() => setOpen(false)}
												className="navigation-overlay-link"
												ariaCurrent={active ? 'page' : undefined}
											>
												{item.icon && <Icon name={item.icon} />}
												{item.label}
											</Interactive>
										</li>
									);
								})}
							</ul>

							{cta && (
								<Button url={cta.url} target={cta.target ?? '_blank'} variant={cta.variant ?? 'primary'} value={cta.label} className="navigation-overlay-cta" onClick={() => setOpen(false)} />
							)}
						</nav>
					</div>
				</>
			)}
		</header>
	);
};

type DashboardHeaderProps = NavigationProps;

const DashboardHeader = ({
	groups = [],
	brand,
	home,
	user,
	backLink,
	searchSlot,
	className,
	open: openProp,
	onOpenChange,
}: DashboardHeaderProps) => {
	const pathname = usePathname();
	const router = useRouter();
	const [value, setValue] = useState<string | null>(null);
	const [internalOpen, setInternalOpen] = useState(false);
	const [seenPath, setSeenPath] = useState(pathname);
	const rootRef = useRef<HTMLElement | null>(null);
	const { listRef, tracker } = useTracker([pathname, value]);

	const open = openProp ?? internalOpen;
	const setOpen = useCallback(
		(next: boolean) => {
			if (openProp === undefined) setInternalOpen(next);
			onOpenChange?.(next);
		},
		[openProp, onOpenChange],
	);

	// Close the desktop panel + overlay on navigation (reset-on-prop-change). Only the locally-owned
	// state resets here; calling onOpenChange during render would set a parent's state, which React forbids.
	if (pathname !== seenPath) {
		setSeenPath(pathname);
		setValue(null);
		if (openProp === undefined) setInternalOpen(false);
	}

	useOverlay(open, () => setOpen(false));

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

			const focusables = Array.from(root.querySelectorAll<HTMLElement>('a[href], button:not([disabled])')).filter((element) => element.offsetParent !== null);
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

	const handleSignOut = useCallback(async () => {
		await signOut();
		router.replace('/login');
	}, [router]);

	const profileMenu = user && (
		<Menu
			ariaLabel="Profielmenu"
			openOnHover
			delay={100}
			closeDelay={200}
			modal={false}
			align="end"
			sideOffset={10}
			className="mega-menu-profile-menu"
			trigger={
				<button type="button" className="mega-menu-profile" aria-label={`Profielmenu — ${user.name}`}>
					<Avatar size="s" src={user.avatarUrl} initials={user.initials} alt="" />
					<span className="mega-menu-profile-text">
						<span className="mega-menu-profile-name">{user.name}</span>
						{user.roleLabel && <span className="mega-menu-profile-role">{user.roleLabel}</span>}
					</span>
					<Icon name="chevron-down" className="mega-menu-profile-chevron" />
				</button>
			}
		>
			<div className="mega-menu-profile-head">
				<Avatar size="m" src={user.avatarUrl} initials={user.initials} alt="" />
				<span className="mega-menu-profile-head-text">
					<span className="mega-menu-profile-head-name">{user.name}</span>
					{user.roleLabel && <Badge variant="primary" value={user.roleLabel} />}
				</span>
			</div>
			<Menu.Separator />
			<Menu.Item url="/account" icon="user" label="Mijn account" />
			{backLink && (
				<Menu.Item url={backLink.href} target="_self" icon="external" label={backLink.label} />
			)}
			<Menu.Separator />
			<Menu.Item icon="logout" label="Uitloggen" onClick={handleSignOut} />
		</Menu>
	);

	return (
		<header ref={rootRef} className={classNames('mega-menu', open && 'is-open', className)}>
			<div className="mega-menu-bar">
				{brand && (
					<Interactive url={home?.href ?? '/dashboard'} className="mega-menu-brand" ariaLabel={brand.title}>
						{brand.src && <Media variant="plain" type="image" src={brand.src} alt="" width={40} height={40} className="mega-menu-logo" />}
						<span className="mega-menu-wordmark">{brand.title}</span>
					</Interactive>
				)}

				<NavigationMenu.Root
					className="mega-menu-nav"
					aria-label="Beheer"
					value={value}
					onValueChange={setValue}
					delay={100}
					closeDelay={200}
				>
					<NavigationMenu.List className="mega-menu-triggers" ref={(element) => void (listRef.current = element)}>
						<span
							className="mega-menu-tracker"
							aria-hidden="true"
							data-visible={tracker ? 'true' : undefined}
							style={tracker ? { transform: `translateX(${tracker.x}px)`, width: `${tracker.width}px` } : undefined}
						/>
						{home && (
							<li className="mega-menu-home">
								<Interactive url={home.href} className={classNames('mega-menu-home-link', homeActive && 'is-active')} ariaCurrent={homeActive ? 'page' : undefined}>
									{home.label}
								</Interactive>
							</li>
						)}
						{groups.map((group) => {
							const active = group.links.some((link) => isLinkActive(pathname, link));
							if (group.directHref) {
								return (
									<li key={group.key} className="mega-menu-item is-direct">
										<Interactive
											url={group.directHref}
											className={classNames('mega-menu-trigger', 'is-direct', group.muted && 'is-muted', active && 'is-active')}
											ariaCurrent={active ? 'page' : undefined}
										>
											{group.label}
											<GroupIndicator group={group} />
										</Interactive>
									</li>
								);
							}
							return (
								<NavigationMenu.Item key={group.key} value={group.key} className={classNames(group.muted && 'is-muted')}>
									<NavigationMenu.Trigger className={classNames('mega-menu-trigger', group.muted && 'is-muted', active && 'is-active')}>
										{group.label}
										<GroupIndicator group={group} />
										<Icon name="chevron-down" className="mega-menu-chevron" />
									</NavigationMenu.Trigger>
									<NavigationMenu.Content className="mega-menu-content">
										<MegaPanelBody group={group} pathname={pathname} />
									</NavigationMenu.Content>
								</NavigationMenu.Item>
							);
						})}
					</NavigationMenu.List>

					<NavigationMenu.Portal>
						<NavigationMenu.Positioner className="mega-menu-positioner" positionMethod="fixed" side="bottom" align="start" sideOffset={24}>
							<NavigationMenu.Popup className="mega-menu-popup">
								<NavigationMenu.Viewport className="mega-menu-viewport" />
							</NavigationMenu.Popup>
						</NavigationMenu.Positioner>
					</NavigationMenu.Portal>
				</NavigationMenu.Root>

				<div className="mega-menu-side">
					{searchSlot}
					{profileMenu}
					<Interactive className="mega-menu-toggle" ariaExpanded={open} ariaLabel={open ? 'Sluit menu' : 'Open menu'} onClick={() => setOpen(!open)}>
						<Icon name={open ? 'close' : 'menu'} />
					</Interactive>
				</div>
			</div>

			<div className="mega-menu-scrim" aria-hidden="true" onClick={() => setOpen(false)} />
			<div className="mega-menu-overlay" aria-hidden={!open} inert={!open}>
				<div className="mega-menu-overlay-head">
					{user ? (
						<span className="mega-menu-overlay-user">
							<Avatar size="s" src={user.avatarUrl} initials={user.initials} alt="" />
							<span className="mega-menu-overlay-user-text">
								<span className="mega-menu-overlay-user-name">{user.name}</span>
								{user.roleLabel && <span className="mega-menu-overlay-user-role">{user.roleLabel}</span>}
							</span>
						</span>
					) : (
						<span className="mega-menu-overlay-title">Menu</span>
					)}
					<Interactive className="mega-menu-overlay-close" ariaLabel="Sluit menu" onClick={() => setOpen(false)}>
						<Icon name="close" />
					</Interactive>
				</div>
				<nav aria-label="Beheer (mobiel)">
					{home && (
						<Interactive
							url={home.href}
							onClick={() => setOpen(false)}
							className={classNames('mega-menu-overlay-home', homeActive && 'is-active')}
							ariaCurrent={homeActive ? 'page' : undefined}
						>
							{home.label}
						</Interactive>
					)}
					{groups.map((group) =>
						group.directHref ? (
							<Interactive
								key={group.key}
								url={group.directHref}
								onClick={() => setOpen(false)}
								className={classNames('mega-menu-overlay-home', group.links.some((link) => isLinkActive(pathname, link)) && 'is-active')}
							>
								{group.label}
							</Interactive>
						) : (
							<section key={group.key} className={classNames('mega-menu-overlay-group', group.muted && 'is-muted')}>
								<h2 className="mega-menu-overlay-heading">
									{group.label}
									<GroupIndicator group={group} />
								</h2>
								<ul>
								{group.links.map((link) => {
									const active = isLinkActive(pathname, link);
									return (
										<li key={link.key}>
											<Interactive
												url={link.href}
												onClick={() => setOpen(false)}
												className={classNames('mega-menu-overlay-link', active && 'is-active')}
												ariaCurrent={active ? 'page' : undefined}
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
					<div className="mega-menu-overlay-account">
						<Interactive url="/account" onClick={() => setOpen(false)} className="mega-menu-overlay-link">
							<Icon name="user" />
							Mijn account
						</Interactive>
						{backLink && (
							<Interactive url={backLink.href} target="_self" onClick={() => setOpen(false)} className="mega-menu-overlay-back">
								<Icon name="external" />
								{backLink.label}
							</Interactive>
						)}
						{user && (
							<Interactive
								className="mega-menu-overlay-back"
								onClick={() => {
									setOpen(false);
									void handleSignOut();
								}}
							>
								<Icon name="logout" />
								Uitloggen
							</Interactive>
						)}
					</div>
				</nav>
			</div>
		</header>
	);
};

const Navigation = ({
	groups,
	home,
	user,
	backLink,
	searchSlot,
	open,
	onOpenChange,
	...publicProps
}: NavigationProps) =>
	groups && groups.length > 0 ? (
		<DashboardHeader
			groups={groups}
			brand={publicProps.brand}
			home={home}
			user={user}
			backLink={backLink}
			searchSlot={searchSlot}
			className={publicProps.className}
			open={open}
			onOpenChange={onOpenChange}
		/>
	) : (
		<PublicHeader items={publicProps.items} cta={publicProps.cta} brand={publicProps.brand} className={publicProps.className} />
	);

export default Navigation;
