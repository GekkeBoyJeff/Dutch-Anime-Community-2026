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
] as const;
export type Permission = (typeof APP_PERMISSIONS)[number];

// Mirrors the public.app_role enum (user/author/yakuza/admin + stand-staff added later).
export const APP_ROLES = ['user', 'author', 'yakuza', 'stand-staff', 'admin'] as const;
export type AppRole = (typeof APP_ROLES)[number];

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

// The current session, kept live via onAuthStateChange.
export const useSession = (): { session: Session | null; loading: boolean } => {
	const [session, setSession] = useState<Session | null>(null);
	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const db = getBrowserClient();
		db.auth.getSession().then(({ data }) => {
			setSession(data.session);
			setLoading(false);
		});
		const { data: sub } = db.auth.onAuthStateChange((_event, next) => setSession(next));
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
	const [fetched, setFetched] = useState<{ userId: string; permissions: Set<Permission> } | null>(null);

	useEffect(() => {
		if (!session) return;
		let active = true;
		getBrowserClient()
			.rpc('my_permissions')
			.then(({ data }) => {
				if (active) setFetched({ userId: session.user.id, permissions: new Set((data ?? []) as Permission[]) });
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
