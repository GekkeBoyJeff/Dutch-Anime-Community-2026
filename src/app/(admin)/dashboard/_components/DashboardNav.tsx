'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import BottomTabBar from '@/components/structures/BottomTabBar';
import MegaMenu, { type MegaMenuUser } from '@/components/structures/MegaMenu';
import { buildNavGroups, buildTabBarItems } from '@/lib/auth/dashboard-sections';
import { usePermissions, ROLE_LABELS, highestRole, type AppRole } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';

// Wires the generic MegaMenu to the live session: groups derive from DASHBOARD_GROUPS filtered by the
// caller's permissions (UX only — RLS is the real boundary), and the chip reads name/avatar from the
// Discord session metadata plus the highest role. A client island because all of that is runtime state.
// The mobile BottomTabBar's "Meer" tab shares the MegaMenu overlay's open state, lifted here.
const DashboardNav = () => {
	const { permissions, session } = usePermissions();
	const [role, setRole] = useState<AppRole | null>(null);
	const [menuOpen, setMenuOpen] = useState(false);
	const pathname = usePathname();
	const [seenPath, setSeenPath] = useState(pathname);

	// Close the overlay on navigation (reset-on-prop-change, no extra effect). `menuOpen` is owned here,
	// so this stays a same-component render-time update — MegaMenu only ever resets its own local state.
	if (pathname !== seenPath) {
		setSeenPath(pathname);
		setMenuOpen(false);
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

	const groups = useMemo(() => buildNavGroups(permissions), [permissions]);
	const tabBarItems = useMemo(() => buildTabBarItems(permissions), [permissions]);

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

	return (
		<>
			<MegaMenu
				brand={{ title: 'Beheer', src: '/media/dac-logo.png' }}
				home={{ label: 'Dashboard', href: '/dashboard' }}
				groups={groups}
				user={user}
				backLink={{ label: 'Terug naar de website', href: '/' }}
				open={menuOpen}
				onOpenChange={setMenuOpen}
			/>
			<BottomTabBar
				items={tabBarItems}
				more={{ label: 'Meer', icon: 'menu', active: menuOpen, onClick: () => setMenuOpen((open) => !open) }}
			/>
		</>
	);
};

export default DashboardNav;
