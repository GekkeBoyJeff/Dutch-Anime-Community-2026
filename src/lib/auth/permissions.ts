'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

import { getBrowserClient } from '@/lib/supabase/client';

// The permission vocabulary — mirrors the public.app_permission enum (migration 0001). Keep in sync.
export type Permission =
	| 'pages.edit'
	| 'pages.delete'
	| 'structures.edit'
	| 'media.manage'
	| 'site.publish'
	| 'moderation.view'
	| 'moderation.manage'
	| 'roles.manage'
	| 'inventory.view'
	| 'inventory.manage';

// Discord OAuth (PKCE) — returns to /auth/callback, which finishes the exchange and redirects to `next`.
export const signInWithDiscord = async (next = '/dashboard'): Promise<void> => {
	const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
	await getBrowserClient().auth.signInWithOAuth({ provider: 'discord', options: { redirectTo, scopes: 'identify email' } });
};

export const signOut = async (): Promise<void> => {
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
