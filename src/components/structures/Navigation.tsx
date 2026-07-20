'use client';

import { NavigationMenu } from '@base-ui/react/navigation-menu';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type ReactNode, type Ref } from 'react';

import Avatar from '@/components/basics/Avatar';
import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Content from '@/components/basics/Content';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import Menu from '@/components/components/Menu';
import useOverlay from '@/hooks/useOverlay';
import { signOut } from '@/lib/auth/permissions';
import { classNames } from '@/lib/classNames';
import type { NavCta as NavCtaSchema, NavigationProps as NavigationSchemaProps, NavItem as NavItemSchema } from '@/lib/content/schema/structures/navigation';

export type NavItem = NavItemSchema;

export type NavCta = NavCtaSchema;

// Dashboard-mode shapes: a domain group whose panel lists links plus an optional right-hand highlight,
// and the signed-in user chip. The staff DashboardNav fills these from permissions + the Discord session.
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
	/** When set, the group is a single destination: rendered as a direct link, not a trigger + panel. */
	directHref?: string;
	/** De-emphasised group (admin's Systeem): the trigger renders dimmed. */
	muted?: boolean;
	/** A live count pill on the trigger (managers' pending-reviews); 0/undefined shows nothing. */
	badge?: number;
	/** A bare attention dot on the trigger (a convention nears, shifts unfilled) when there's no count. */
	dot?: boolean;
}

export interface MegaMenuUser {
	name: string;
	roleLabel?: string;
	avatarUrl?: string;
	initials?: string;
}

// Passing `groups` switches the header into the staff dashboard mega-menu; without it, it is the public
// site header. The two modes share the pill/tracker/roundel styling; only the pill's contents differ.
type NavigationProps = NavigationSchemaProps & {
	/** The dashboard hub link shown before the group triggers; active on its exact route. */
	home?: { label: string; href: string };
	/** Dashboard mode: the domain groups whose triggers open full-width mega-panels. */
	groups?: MegaMenuGroup[];
	/** Dashboard mode: the signed-in user chip. */
	user?: MegaMenuUser;
	/** Dashboard mode: the "Terug naar de website" affordance. */
	backLink?: { label: string; href: string };
	/** Dashboard mode: an extra trigger in the right cluster (the ⌘K search pill). */
	searchSlot?: ReactNode;
	/** Dashboard mode: controls the mobile overlay from outside (e.g. a "Meer" tab). */
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
};

// A nav item is active on its exact route and on any route nested below it (so /blog stays lit on
// /blog/post). Home ('/') matches only its exact path; external and anchor links never light up.
// Exported so other nav surfaces (BottomTabBar) apply the identical active-route logic.
export const isActivePath = (pathname: string, url: string, exact = false): boolean => {
	if (!url.startsWith('/')) {
		return false;
	}
	if (exact || url === '/') {
		return pathname === url;
	}
	return pathname === url || pathname.startsWith(`${url}/`);
};

// A dashboard link is also active on any of its `activeHrefs` — detail routes reached from it that don't
// nest under its own href (e.g. the event editor doesn't live under /dashboard/inventory).
const isLinkActive = (pathname: string, link: MegaMenuLink): boolean =>
	isActivePath(pathname, link.href) || (link.activeHrefs ?? []).some((href) => isActivePath(pathname, href));

// The live indicator on a group trigger: a count pill when there's a number to show (pending reviews),
// otherwise a bare attention dot (something waits but has no count). Nothing renders when neither is set.
const GroupIndicator = ({ group }: { group: MegaMenuGroup }) => {
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

// One mega-panel link: icon + label + description, routed through next/link and closing the panel on click.
const PanelLink = ({ link, active }: { link: MegaMenuLink; active: boolean }) => (
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

// The swappable half of one group's panel: the link rows (middle) and the group's highlight (right). The
// left group-switcher rail lives once in the popup, outside the viewport, so it never cross-fades on swap.
const MegaPanelBody = ({ group, pathname }: { group: MegaMenuGroup; pathname: string }) => (
	<div className={classNames('mega-menu-panel', Boolean(group.highlight) && 'has-highlight')}>
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

// The sliding tracker used by both modes: a dark pill measured onto the active/open trigger, inverting it.
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

// The public site header: a floating pill nav with a sliding tracker that marks the active link by
// inverting whatever sits beneath it, a brand roundel, and a CTA tab carved into the page frame's
// top-right corner with concave corner cutouts. On small screens the pill holds a menu toggle that opens
// a full-screen overlay. Drive items/cta/brand from structures.ts — nothing is hardcoded.
const PublicHeader = ({ items = [], cta, brand, className, ref }: NavigationSchemaProps & { ref?: Ref<HTMLElement> }) => {
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

	// While the full-screen overlay is open, keep keyboard focus inside the header (toggle, CTA tab
	// and overlay links are all visible above it); restore focus to the trigger on close. The page
	// behind the overlay stays in the DOM but is unreachable by Tab, matching what the eye sees.
	// Focus-trap pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
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

	// The brand roundel links to / on the public site, but is decorative (a plain span) in the beheer
	// nav — there "Dashboard" is home and a link to the public / would be confusing.
	const brandContent = (
		<>
			{brand?.src && <Media variant="plain" type="image" src={brand.src} alt="" width={48} height={48} className="navigation-logo" />}
			{brand?.title && <Content element="span" className="navigation-wordmark" value={brand.title} />}
		</>
	);

	return (
		<header
			ref={(element) => {
				rootRef.current = element;
				if (typeof ref === 'function') {
					ref(element);
				} else if (ref) {
					ref.current = element;
				}
			}}
			className={classNames('navigation', open && 'is-open', className)}
		>
			<div className="navigation-bar">
				{brand?.interactive === false ? (
					<span className="navigation-brand">{brandContent}</span>
				) : (
					<Interactive url="/" className="navigation-brand" aria-label={brand?.title ?? 'Home'}>
						{brandContent}
					</Interactive>
				)}

				<nav className="navigation-pill" aria-label="Primary">
					<Interactive className="navigation-toggle" aria-expanded={open} aria-label={open ? 'Sluit menu' : 'Open menu'} onClick={() => setOpen(!open)}>
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
											<Interactive url={item.url} target={item.target} className="navigation-link" aria-current={active ? 'page' : undefined}>
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
					<Button url={cta.url} target={cta.target ?? '_blank'} variant={cta.variant ?? 'primary'} className="navigation-cta">
						{cta.label}
					</Button>
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
												aria-current={active ? 'page' : undefined}
											>
												{item.icon && <Icon name={item.icon} />}
												{item.label}
											</Interactive>
										</li>
									);
								})}
							</ul>

							{cta && (
								<Button url={cta.url} target={cta.target ?? '_blank'} variant={cta.variant ?? 'primary'} className="navigation-overlay-cta" onClick={() => setOpen(false)}>
									{cta.label}
								</Button>
							)}
						</nav>
					</div>
				</>
			)}
		</header>
	);
};

// The staff dashboard header: the same floating pill + sliding tracker + roundel as the public nav, but
// its triggers open full-width mega-panels (Base UI Navigation Menu, hover-intent with click/keys/touch),
// and the right cluster carries the search pill, user chip and back link. The panel fuses to the bar. On
// small screens the triggers collapse into a group-sectioned overlay with a focus trap.
const DashboardHeader = ({
	groups = [],
	brand,
	home,
	user,
	backLink,
	searchSlot,
	className,
	ref,
	open: openProp,
	onOpenChange,
}: NavigationProps & { ref?: Ref<HTMLElement> }) => {
	const pathname = usePathname();
	const router = useRouter();
	const [value, setValue] = useState<string | null>(null);
	const [internalOpen, setInternalOpen] = useState(false);
	const [seenPath, setSeenPath] = useState(pathname);
	const rootRef = useRef<HTMLElement | null>(null);
	const barRef = useRef<HTMLDivElement | null>(null);
	const { listRef, tracker } = useTracker([pathname, value]);

	// Controlled/uncontrolled: an external open+onOpenChange (e.g. BottomTabBar's "Meer" tab) drives the
	// same overlay; otherwise it manages its own state.
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

	// The signed-in user sits on its own at the top-right and opens a hover dropdown (profile header +
	// account, back-to-site and sign-out). Lightweight, non-modal — it never traps focus or locks scroll.
	const profileMenu = user && (
		<Menu
			label="Profielmenu"
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
					{user.roleLabel && <Badge variant="primary">{user.roleLabel}</Badge>}
				</span>
			</div>
			<Menu.Separator />
			<Menu.Item url="/account" icon="user" label="Mijn account">
				Mijn account
			</Menu.Item>
			{backLink && (
				<Menu.Item url={backLink.href} target="_self" icon="external" label={backLink.label}>
					{backLink.label}
				</Menu.Item>
			)}
			<Menu.Separator />
			<Menu.Item icon="logout" label="Uitloggen" onClick={handleSignOut}>
				Uitloggen
			</Menu.Item>
		</Menu>
	);

	return (
		<header
			ref={(element) => {
				rootRef.current = element;
				if (typeof ref === 'function') ref(element);
				else if (ref) ref.current = element;
			}}
			className={classNames('mega-menu', open && 'is-open', value !== null && 'is-panel-open', className)}
		>
			<div className="mega-menu-bar" ref={barRef}>
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
					onValueChange={setValue}
					// Hover-intent: a short dwell before opening on a horizontal sweep, forgiving the hop down into
					// the panel. Click/keys/touch stay instant (Base UI zeroes the delay once a group is open).
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
								<Interactive url={home.href} className={classNames('mega-menu-home-link', homeActive && 'is-active')} aria-current={homeActive ? 'page' : undefined}>
									{home.label}
								</Interactive>
							</li>
						)}
						{groups.map((group) => {
							const active = group.links.some((link) => isLinkActive(pathname, link));
							// A single-destination group (directHref) is a plain link, not a trigger — a mega-panel for one
							// link is noise (blueprint §1c: the user's "Mijn DAC" is one ingang, not a megamenu).
							if (group.directHref) {
								return (
									<li key={group.key} className="mega-menu-item is-direct">
										<Interactive
											url={group.directHref}
											className={classNames('mega-menu-trigger', 'is-direct', group.muted && 'is-muted', active && 'is-active')}
											aria-current={active ? 'page' : undefined}
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
						{/* Anchored to the whole bar (not the active trigger): position/width are owned by CSS, so the
						    panel is full-width and never shifts or flips between groups — it reads as one piece with the bar. */}
						<NavigationMenu.Positioner
							className="mega-menu-positioner"
							data-theme="admin"
							data-colorset="light"
							anchor={barRef}
							positionMethod="fixed"
							side="bottom"
							align="start"
							sideOffset={0}
							collisionAvoidance={{ side: 'none', align: 'none' }}
						>
							<NavigationMenu.Popup className="mega-menu-popup">
								<div className="mega-menu-shell">
									<div className="mega-menu-rail">
										{groups.filter((group) => !group.directHref).map((group) => (
											// A switcher card per group: hover/tap swaps the open panel instantly (no reopen flash).
											// A pointer affordance only (tabIndex -1) — the trigger row owns the keyboard group-switching,
											// so tabbing into the panel reaches the links directly instead of hopping between groups.
											<button
												key={group.key}
												type="button"
												tabIndex={-1}
												className={classNames('mega-menu-rail-card', group.key === value && 'is-active')}
												aria-current={group.key === value ? 'true' : undefined}
												onMouseEnter={() => setValue(group.key)}
												onClick={() => setValue(group.key)}
											>
												<span className="mega-menu-rail-text">
													<span className="mega-menu-rail-label">{group.label}</span>
													<span className="mega-menu-rail-description">{group.description}</span>
												</span>
												<Icon name="chevron-right" className="mega-menu-rail-chevron" />
											</button>
										))}
									</div>
									<NavigationMenu.Viewport className="mega-menu-viewport" />
								</div>
							</NavigationMenu.Popup>
						</NavigationMenu.Positioner>
					</NavigationMenu.Portal>
				</NavigationMenu.Root>

				<div className="mega-menu-side">
					{searchSlot}
					{profileMenu}
					<Interactive className="mega-menu-toggle" aria-expanded={open} aria-label={open ? 'Sluit menu' : 'Open menu'} onClick={() => setOpen(!open)}>
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
					<Interactive className="mega-menu-overlay-close" aria-label="Sluit menu" onClick={() => setOpen(false)}>
						<Icon name="close" />
					</Interactive>
				</div>
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

// One header component, two modes: pass `groups` for the staff dashboard mega-menu, or `items`/`cta` for
// the public site. Both share the pill/tracker/roundel; SiteChrome uses the public mode, DashboardNav the
// dashboard mode. The dashboard mega-menu is hung on this shared component.
const Navigation = ({ ref, groups, home, user, backLink, searchSlot, open, onOpenChange, ...publicProps }: NavigationProps & { ref?: Ref<HTMLElement> }) =>
	groups && groups.length > 0 ? (
		<DashboardHeader
			ref={ref}
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
		<PublicHeader ref={ref} items={publicProps.items} cta={publicProps.cta} brand={publicProps.brand} className={publicProps.className} />
	);

export default Navigation;
