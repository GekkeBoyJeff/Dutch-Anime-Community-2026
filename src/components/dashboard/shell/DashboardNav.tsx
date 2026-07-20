'use client';

import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';

import Icon from '@/components/basics/Icon';
import Media from '@/components/basics/Media';
import Shortcut from '@/components/basics/Shortcut';
import Skeleton from '@/components/basics/Skeleton';
import BottomTabBar from '@/components/dashboard/structures/BottomTabBar';
import CommandPalette, { type PaletteResult } from '@/components/dashboard/structures/CommandPalette';
import Navigation, { type MegaMenuUser } from '@/components/structures/Navigation';
import useHotkey from '@/hooks/useHotkey';
import { buildNavGroups, buildPaletteActions, buildPalettePages, buildTabBarItems, palettePersonSearchHref } from '@/lib/auth/dashboard-sections';
import { emphasisRole, usePermissions, ROLE_LABELS, highestRole, type AppRole, type Permission } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';

import { NAV_HIGHLIGHTS } from './NavHighlights';

interface NavIndicator {
	dot?: boolean;
	badge?: number;
}

// Live per-group nav indicators (blueprint §2 C1/C5/C6): a count pill or an attention dot on a group's
// trigger when something waits, so a manager sees it without opening the panel. Deliberately cheap — one
// eager pass of head/limited count queries on mount (the NavHighlights inside the panels stay lazy). Each
// query is gated on the same permission that guards its data; RLS stays the real boundary.
const useNavIndicators = (permissions: ReadonlySet<Permission>): Record<string, NavIndicator> => {
	const [indicators, setIndicators] = useState<Record<string, NavIndicator>>({});
	const canOps = permissions.has('inventory.manage');
	const canFin = permissions.has('expenses.manage');

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		(async () => {
			const next: Record<string, NavIndicator> = {};
			const today = new Date().toISOString().slice(0, 10);
			const in14 = new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10);

			if (canOps) {
				// C1: a convention within 14 days. If none, C6: any unfilled shift on an upcoming convention.
				const { data: soon } = await db.from('events').select('id').is('archived_at', null).gte('starts_on', today).lte('starts_on', in14).limit(1);
				let dot = (soon?.length ?? 0) > 0;
				if (!dot) {
					const { data: upcoming } = await db.from('events').select('id').is('archived_at', null).gte('starts_on', today).limit(10);
					const ids = (upcoming ?? []).map((event) => event.id);
					if (ids.length > 0) {
						const { data: openShifts } = await db.from('event_shifts').select('id').in('event_id', ids).is('subject_id', null).limit(1);
						dot = (openShifts?.length ?? 0) > 0;
					}
				}
				if (dot) next.operaties = { dot: true };
			}

			if (canFin) {
				// C5: declaraties awaiting review → a count pill on Financiën.
				const { count } = await db.from('expenses').select('id', { count: 'exact', head: true }).eq('status', 'submitted').is('archived_at', null);
				if ((count ?? 0) > 0) next.financien = { badge: count ?? 0 };
			}

			if (active) setIndicators(next);
		})();
		return () => {
			active = false;
		};
	}, [canOps, canFin]);

	return indicators;
};

// The ⌘K hint glyph, read via useSyncExternalStore so the server/hydration render stays '⌘' and only the
// client corrects to 'Ctrl' off-Mac — no setState-in-effect, no hydration mismatch. The platform never
// changes within a session, so the subscription is a no-op.
const noopSubscribe = () => () => {};
const readModKey = () => (/Mac|iPhone|iPad/.test(navigator.platform) ? '⌘' : 'Ctrl');
const serverModKey = () => '⌘';

// Cold-load nav: the mega-menu bar shell (brand + wordmark, trigger-pill placeholders, search + avatar
// slots) rendered while permissions resolve, so a slow load reads as the app arriving. Without it the
// generic Navigation falls back to its bare public-header mode (groups is empty pre-permissions). Same
// fixed bar box as the live nav → no shift when it swaps in.
const NAV_PILL_WIDTHS = ['5rem', '6.5rem', '5.5rem', '7rem'];

const DashboardNavSkeleton = () => (
	<header className="mega-menu" aria-hidden="true">
		<div className="mega-menu-bar">
			<span className="mega-menu-brand">
				<Media variant="plain" type="image" src="/media/dac-logo.png" alt="" width={40} height={40} className="mega-menu-logo" />
				<span className="mega-menu-wordmark">Beheer</span>
			</span>
			<div className="mega-menu-nav">
				<div className="mega-menu-nav-skeleton">
					{NAV_PILL_WIDTHS.map((width) => (
						<Skeleton key={width} height="2.25rem" width={width} radius="l" />
					))}
				</div>
			</div>
			<div className="mega-menu-side">
				<Skeleton height="2.5rem" width="9rem" radius="l" />
				<Skeleton circle width="2.25rem" height="2.25rem" />
			</div>
		</div>
	</header>
);

// Wires the generic MegaMenu to the live session: groups derive from DASHBOARD_GROUPS filtered by the
// caller's permissions (UX only — RLS is the real boundary), and the chip reads name/avatar from the
// Discord session metadata plus the highest role. A client island because all of that is runtime state.
// The mobile BottomTabBar's "Meer" tab shares the MegaMenu overlay's open state, lifted here.
const DashboardNavReady = () => {
	const { permissions, session } = usePermissions();
	const [role, setRole] = useState<AppRole | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const modKey = useSyncExternalStore(noopSubscribe, readModKey, serverModKey);
	const pathname = usePathname();
	const [seenPath, setSeenPath] = useState(pathname);

	// ⌘K (Cmd/Ctrl+K) toggles the palette from anywhere.
	useHotkey(
		'mod+k',
		useCallback(() => setPaletteOpen((open) => !open), []),
	);

	// Close the overlay on navigation (reset-on-prop-change, no extra effect). `menuOpen` is owned here,
	// so this stays a same-component render-time update — MegaMenu only ever resets its own local state.
	if (pathname !== seenPath) {
		setSeenPath(pathname);
		setMenuOpen(false);
		setPaletteOpen(false);
	}

	useEffect(() => {
		if (!session) return;
		let active = true;
		getBrowserClient()
			.from('user_roles')
			.select('role')
			.eq('user_id', session.user.id)
			.then(({ data }) => {
				if (active) setRole(highestRole((data ?? []).map((row) => row.role as AppRole)));
			});
		return () => {
			active = false;
		};
	}, [session]);

	const indicators = useNavIndicators(permissions);

	// Attach each group's live highlight node onto the permission-filtered groups (the node self-fetches
	// only when its panel opens). Groups are ordered for the emphasis role (blueprint §1c); a collapsed
	// single-link group (directHref) renders as a plain link, so it takes no highlight. The cheap
	// per-group indicator (dot/badge) rides along so a manager sees it without opening anything.
	const groups = useMemo(
		() =>
			buildNavGroups(permissions, emphasisRole(permissions)).map((group) => ({
				...group,
				highlight: group.directHref ? undefined : NAV_HIGHLIGHTS[group.key],
				dot: indicators[group.key]?.dot,
				badge: indicators[group.key]?.badge,
			})),
		[permissions, indicators],
	);
	const tabBarItems = useMemo(() => buildTabBarItems(permissions), [permissions]);
	const palettePages = useMemo(() => buildPalettePages(permissions), [permissions]);
	const paletteActions = useMemo(() => buildPaletteActions(permissions), [permissions]);
	const personSearchHref = useMemo(() => palettePersonSearchHref(permissions), [permissions]);

	// Live palette search over real records: conventions (open the editor) and members (open their moderation
	// profile), each gated on the same permission that guards its destination. RLS stays the real boundary.
	const canSearchEvents = permissions.has('inventory.manage');
	const canSearchPeople = permissions.has('moderation.view');
	const searchEntities = useCallback(
		async (query: string): Promise<PaletteResult[]> => {
			const db = getBrowserClient();
			const like = `%${query}%`;
			const jobs: Promise<PaletteResult[]>[] = [];
			if (canSearchEvents) {
				jobs.push(
					(async () => {
						const { data } = await db.from('events').select('id, name, location').ilike('name', like).order('starts_on', { ascending: false, nullsFirst: false }).limit(6);
						return (data ?? []).map((event) => ({ key: `event:${event.id}`, group: 'events' as const, label: event.name, sublabel: event.location, href: `/dashboard/events?id=${event.id}`, icon: 'calendar' }));
					})(),
				);
			}
			if (canSearchPeople) {
				jobs.push(
					(async () => {
						const { data } = await db.from('subject_names').select('id, display_name').ilike('display_name', like).limit(6);
						return (data ?? [])
							.filter((person): person is { id: string; display_name: string } => person.display_name !== null)
							.map((person) => ({ key: `person:${person.id}`, group: 'people' as const, label: person.display_name, href: `/dashboard/moderation?id=${person.id}`, icon: 'user' }));
					})(),
				);
			}
			return (await Promise.all(jobs)).flat();
		},
		[canSearchEvents, canSearchPeople],
	);

	const user = useMemo<MegaMenuUser | undefined>(() => {
		if (!session) return undefined;
		const meta = session.user.user_metadata ?? {};
		const name = (meta.full_name as string) || (meta.name as string) || (meta.user_name as string) || session.user.email || 'Beheerder';
		return {
			name,
			avatarUrl: (meta.avatar_url as string) || (meta.picture as string) || undefined,
			initials: name.slice(0, 2).toUpperCase(),
			roleLabel: role ? ROLE_LABELS[role] : undefined,
		};
	}, [session, role]);

	const searchPill = (
		<button type="button" className="command-pill" onClick={() => setPaletteOpen(true)} aria-label="Snelzoeken openen">
			<Icon name="search" className="command-pill-icon" />
			<span className="command-pill-label">Zoeken…</span>
			<Shortcut keys={[modKey, 'K']} separator="" className="command-pill-hint" />
		</button>
	);

	return (
		<>
			<Navigation
				brand={{ title: 'Beheer', src: '/media/dac-logo.png' }}
				home={{ label: 'Dashboard', href: '/dashboard' }}
				groups={groups}
				user={user}
				backLink={{ label: 'Terug naar de website', href: '/' }}
				searchSlot={searchPill}
				open={menuOpen}
				onOpenChange={setMenuOpen}
			/>
			<CommandPalette
				open={paletteOpen}
				onOpenChange={setPaletteOpen}
				pages={palettePages}
				actions={paletteActions}
				personSearchHref={personSearchHref ?? undefined}
				searchEntities={canSearchEvents || canSearchPeople ? searchEntities : undefined}
			/>
			<BottomTabBar
				items={tabBarItems}
				more={{ label: 'Meer', icon: 'menu', active: menuOpen, onClick: () => setMenuOpen((open) => !open) }}
			/>
		</>
	);
};

// On a warm session cache `loading` is already false (no flash); only a cold/slow load shows the skeleton
// bar. The live nav mounts fresh once permissions resolve — the skeleton holds none of its own state.
const DashboardNav = () => {
	const { loading } = usePermissions();
	return loading ? <DashboardNavSkeleton /> : <DashboardNavReady />;
};

export default DashboardNav;
