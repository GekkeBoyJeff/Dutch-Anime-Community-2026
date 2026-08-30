'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

import { env } from '@/lib/shared/env';
import { unsubscribePush } from '@/lib/shared/push';
import { getBrowserClient } from '@/lib/shared/supabase/client';

// The permission vocabulary — mirrors the public.app_permission enum; a value added here is inert until
// the matching DB enum migration lands, because RLS reads the enum, not this list.
export const APP_PERMISSIONS = [
	'pages.create',
	'pages.edit',
	'pages.delete',
	'structures.edit',
	'media.upload',
	'media.delete',
	'site.publish_staging',
	'site.approve',
	'moderation.view',
	'moderation.manage',
	'roles.manage',
	'events.view',
	'events.manage',
	'inventory.view',
	'inventory.manage',
	'expenses.view',
	'expenses.review',
	'finance.view',
	'finance.manage',
	'staff.view',
	'staff.manage',
	'surveys.manage',
	'surveys.results',
	'notifications.send',
	'notifications.manage',
	'logs.view',
	'badges.manage',
	'records.delete',
] as const;
export type Permission = (typeof APP_PERMISSIONS)[number];

// Mirrors the public.app_role enum, ordered least → most privileged — highestRole reads that order.
export const APP_ROLES = ['user', 'author', 'yakuza', 'stand-staff', 'admin'] as const;
export type AppRole = (typeof APP_ROLES)[number];

export const ROLE_LABELS: Record<AppRole, string> = {
	user: 'Lid',
	author: 'Auteur',
	yakuza: 'Yakuza',
	'stand-staff': 'Standteam',
	admin: 'Beheerder',
};

// For the display chip only — never a gate.
export const highestRole = (roles: readonly AppRole[]): AppRole | null =>
	roles.reduce<AppRole | null>((best, role) => (best === null || APP_ROLES.indexOf(role) > APP_ROLES.indexOf(best) ? role : best), null);

// Presentation only: picks the top tier to tilt order and emphasis toward — the permission gates still
// decide what is visible.
export const emphasisRole = (permissions: ReadonlySet<Permission>): AppRole => {
	if (permissions.has('roles.manage')) return 'admin';
	if (permissions.has('events.manage') || permissions.has('staff.manage') || permissions.has('moderation.view')) return 'yakuza';
	if (permissions.has('pages.edit') || permissions.has('media.upload')) return 'author';
	if (permissions.has('inventory.view')) return 'stand-staff';
	return 'user';
};

// Open-redirect guard: only same-site relative paths are allowed as a post-login destination. The extra
// checks reject protocol-relative (`//evil`) and backslash tricks (`/\evil`), which `startsWith('/')` lets through.
export const safeNext = (raw: string | null | undefined): string => {
	if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/dashboard';
	return raw;
};

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

// Module-scope caches (UX only — RLS stays the boundary): a remounting hook starts from the last known
// value and revalidates. Cleared on sign-out so stale permissions never linger.
let sessionCache: { session: Session | null } | null = null;
let permissionsCache: { userId: string; permissions: Set<Permission> } | null = null;

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
// RLS still enforces on the DB — this only drives what the UI shows.
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
