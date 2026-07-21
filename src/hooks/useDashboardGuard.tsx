'use client';

import type { Session } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import { DASHBOARD_SECTIONS } from '@/lib/auth/dashboard-sections';
import { usePermissions, type Permission } from '@/lib/auth/permissions';

interface DashboardGuardOptions {
	/** Container class for the loading fallback, matching the screen's own block */
	className?: string;
	/** Spinner label shown while gating */
	label?: string;
	/** A layout-shaped placeholder shown while permissions load, instead of the bare spinner. The
	 *  transient redirect states (signed-out / unauthorised) still fall back to the spinner. */
	skeleton?: ReactNode;
}

interface DashboardGuard {
	/** True once signed in AND authorised — render the screen only when this is true */
	ready: boolean;
	/** Prebuilt loading/redirect fallback (a spinner); null once ready */
	fallback: ReactNode | null;
	/** The live session; safe to use with `!` after `if (!ready) return fallback` */
	session: Session | null;
	/** The caller's effective permissions */
	permissions: ReadonlySet<Permission>;
}

// The guard/redirect/loading block every dashboard screen repeated, extracted once. Pass the permission
// a screen requires; omit it for the hub, which admits anyone holding at least one dashboard section.
// Signed-out → /login?next=<here>; signed in but unauthorised → /dashboard (or /account for the hub).
// This is routing, not enforcement: RLS is the security boundary, so a member without permissions can
// read nothing anyway — the redirect only keeps them off a screen that would render empty.
// Keep each screen's data fetch in its OWN effect, gated on `ready` — do not fold the fetch in here.
export const useDashboardGuard = (permission?: Permission, options?: DashboardGuardOptions): DashboardGuard => {
	const router = useRouter();
	const pathname = usePathname();
	const { permissions, loading, session } = usePermissions();
	const holdsAnySection = DASHBOARD_SECTIONS.some((section) => permissions.has(section.permission));
	const allowed = permission ? permissions.has(permission) : Boolean(session) && holdsAnySection;

	useEffect(() => {
		if (loading) return;
		if (!session) {
			router.replace(`/login?next=${pathname}`);
			return;
		}
		if (!allowed) router.replace(permission ? '/dashboard' : '/account');
	}, [loading, session, allowed, permission, pathname, router]);

	const ready = !loading && Boolean(session) && allowed;
	return {
		ready,
		session,
		permissions,
		fallback: ready ? null : (
			<Container className={options?.className}>
				{loading && options?.skeleton ? options.skeleton : <Spinner label={options?.label ?? 'Laden'} />}
			</Container>
		),
	};
};
