'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

import { env } from '@/lib/env';
import { unsubscribePush } from '@/lib/push';
import { getBrowserClient } from '@/lib/supabase/client';

// The permission vocabulary — mirrors the public.app_permission enum. SINGLE SOURCE: the runtime array
// drives both the `Permission` type and the AccessManager UI, so adding a permission is one edit here
// (+ the DB enum migration). Keep the order/values in sync with the enum.
export const APP_PERMISSIONS = [
	'pages.edit',
	'pages.delete',
	'structures.edit',
	'media.manage',
	'site.publish',
	'moderation.view',
	'moderation.manage',
	'roles.manage',
	'inventory.view',
	'inventory.manage',
	'expenses.view',
	'expenses.manage',
	'logs.view',
	'badges.manage',
	'records.delete',
	'notifications.send',
	'surveys.manage',
	'staff.manage',
] as const;
export type Permission = (typeof APP_PERMISSIONS)[number];

// Mirrors the public.app_role enum (user/author/yakuza/admin + stand-staff added later).
export const APP_ROLES = ['user', 'author', 'yakuza', 'stand-staff', 'admin'] as const;
export type AppRole = (typeof APP_ROLES)[number];

// Human labels for the role chip. APP_ROLES is ordered least → most privileged, so a later index wins.
export const ROLE_LABELS: Record<AppRole, string> = {
	user: 'Lid',
	author: 'Auteur',
	yakuza: 'Yakuza',
	'stand-staff': 'Standteam',
	admin: 'Beheerder',
};

// The most privileged role a user holds (null when none), for the display chip only — never a gate.
export const highestRole = (roles: readonly AppRole[]): AppRole | null =>
	roles.reduce<AppRole | null>((best, role) => (best === null || APP_ROLES.indexOf(role) > APP_ROLES.indexOf(best) ? role : best), null);

// The role whose emphasis the dashboard leans on, derived from the EFFECTIVE permission set rather than a
// role read — so home-widget order and nav-group order are synchronous with the permissions themselves (no
// reorder-after-fetch, no CLS). Presentation only: the permission gates still decide what is visible, and a
// multi-role person still sees both halves; this only picks the top tier to tilt order/emphasis toward.
export const emphasisRole = (permissions: ReadonlySet<Permission>): AppRole => {
	if (permissions.has('roles.manage')) return 'admin';
	if (permissions.has('inventory.manage') || permissions.has('staff.manage') || permissions.has('moderation.view')) return 'yakuza';
	if (permissions.has('pages.edit') || permissions.has('media.manage')) return 'author';
	if (permissions.has('inventory.view')) return 'stand-staff';
	return 'user';
};

// Open-redirect guard: only same-site relative paths are allowed as a post-login destination.
// Rejects absolute URLs, protocol-relative (`//evil`), and backslash tricks (`/\evil`).
export const safeNext = (raw: string | null | undefined): string => {
	if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/dashboard';
	return raw;
};

// Discord OAuth (PKCE) — returns to /auth/callback, which finishes the exchange and redirects to `next`.
// window.location.origin mist het basePath (Next bakt dat alleen in router/Link, niet in origin), dus voeg
// NEXT_PUBLIC_BASE_PATH handmatig toe — anders 404't de callback op een subpad-host (bv. GitHub Pages).
export const signInWithDiscord = async (next = '/dashboard'): Promise<void> => {
	const redirectTo = `${window.location.origin}${env.NEXT_PUBLIC_BASE_PATH}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
	await getBrowserClient().auth.signInWithOAuth({ provider: 'discord', options: { redirectTo, scopes: 'identify email guilds guilds.members.read' } });
};

// Ruim eerst het push-abonnement op (nog ingelogd → de RLS-scoped DELETE raakt de eigen rij), pas daarna
// uitloggen. Andersom zou de DELETE anoniem draaien en stil 0 rijen raken, waardoor een gedeeld/opnieuw
// toegewezen apparaat de meldingen van de vorige gebruiker zou blijven ontvangen.
export const signOut = async (): Promise<void> => {
	await unsubscribePush().catch(() => undefined);
	await getBrowserClient().auth.signOut();
};

// Module-scope caches (UX only — RLS stays the boundary). They let a hook that remounts on client
// navigation initialise from the last known value synchronously — no loading flash, no nav collapse —
// then silently revalidate. Cleared on sign-out so the forced-logout path still redirects and stale
// permissions never linger. A hard page reload re-evaluates this module, so cold-load behaviour returns.
let sessionCache: { session: Session | null } | null = null;
let permissionsCache: { userId: string; permissions: Set<Permission> } | null = null;

// The current session, kept live via onAuthStateChange. On remount it starts from the module cache, so a
// warm cache means loading is already false (no spinner). A sign-out event also clears permissionsCache.
export const useSession = (): { session: Session | null; loading: boolean } => {
	const [session, setSession] = useState<Session | null>(() => sessionCache?.session ?? null);
	const [loading, setLoading] = useState(() => sessionCache === null);
	useEffect(() => {
		const db = getBrowserClient();
		db.auth.getSession().then(({ data }) => {
			sessionCache = { session: data.session };
			if (!data.session) permissionsCache = null;
			setSession(data.session);
			setLoading(false);
		});
		const { data: sub } = db.auth.onAuthStateChange((_event, next) => {
			sessionCache = { session: next };
			if (!next) permissionsCache = null;
			setSession(next);
			setLoading(false);
		});
		return () => sub.subscription.unsubscribe();
	}, []);
	return { session, loading };
};

const EMPTY_PERMISSIONS: ReadonlySet<Permission> = new Set();

// The caller's effective permissions (role bundle ∪ per-user grants), from the my_permissions() RPC.
// RLS still enforces on the DB — this only drives what the UI shows. Permissions are derived (memoized)
// so the returned Set is referentially stable: signed-out → a shared EMPTY set; signed-in → the fetched
// set. setState happens only inside the async callback, never synchronously in the effect body.
export const usePermissions = (): { permissions: ReadonlySet<Permission>; loading: boolean; session: Session | null } => {
	const { session, loading: sessionLoading } = useSession();
	const [fetched, setFetched] = useState<{ userId: string; permissions: Set<Permission> } | null>(() => permissionsCache);

	useEffect(() => {
		if (!session) return;
		let active = true;
		getBrowserClient()
			.rpc('my_permissions')
			.then(({ data }) => {
				if (!active) return;
				const next = { userId: session.user.id, permissions: new Set((data ?? []) as Permission[]) };
				permissionsCache = next;
				setFetched(next);
			});
		return () => {
			active = false;
		};
	}, [session]);

	const permissions = useMemo<ReadonlySet<Permission>>(
		() => (session && fetched?.userId === session.user.id ? fetched.permissions : EMPTY_PERMISSIONS),
		[session, fetched],
	);
	const loading = sessionLoading || (Boolean(session) && fetched?.userId !== session?.user.id);
	return { permissions, loading, session };
};
