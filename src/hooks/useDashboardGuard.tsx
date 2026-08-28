'use client';

import type { Session } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';

import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import { DASHBOARD_SECTIONS } from '@/lib/shared/auth/dashboard-sections';
import { usePermissions, type Permission } from '@/lib/shared/auth/permissions';

interface DashboardGuardOptions {
	className?: string;
	ariaLabel?: string;
	skeleton?: ReactNode;
}

interface DashboardGuard {
	ready: boolean;
	fallback: ReactNode | null;
	session: Session | null;
	permissions: ReadonlySet<Permission>;
}

// This is routing, not enforcement: RLS is the security boundary, so a member without permissions can
// read nothing anyway — the redirect only keeps them off a screen that would render empty.
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
				{loading && options?.skeleton ? options.skeleton : <Spinner ariaLabel={options?.ariaLabel ?? 'Laden'} />}
			</Container>
		),
	};
};
