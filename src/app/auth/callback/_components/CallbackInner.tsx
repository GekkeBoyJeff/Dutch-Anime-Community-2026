'use client';

import type { Session } from '@supabase/supabase-js';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import { safeNext } from '@/lib/shared/auth/permissions';
import { getBrowserClient } from '@/lib/shared/supabase/client';

// Discord OAuth returns here with a `?code=`. supabase-js (detectSessionInUrl, default) exchanges it
// for a session on load; we then redirect to `next` (open-redirect-guarded). The provider_token is only
// present right after OAuth — fire the guild-sync Edge Function once (best-effort) before redirecting.
const CallbackInner = () => {
	const router = useRouter();
	const next = safeNext(useSearchParams().get('next'));
	useEffect(() => {
		const db = getBrowserClient();
		let synced = false;
		const syncGuild = (session: Session | null) => {
			if (session?.provider_token && !synced) {
				synced = true;
				db.functions.invoke('discord-sync', { body: { provider_token: session.provider_token } }).catch(() => {});
			}
		};
		const { data: sub } = db.auth.onAuthStateChange((_event, session) => {
			if (session) {
				syncGuild(session);
				router.replace(next);
			}
		});
		db.auth.getSession().then(({ data }) => {
			if (data.session) {
				syncGuild(data.session);
				router.replace(next);
			}
		});
		return () => sub.subscription.unsubscribe();
	}, [router, next]);
	return (
		<Container element="main" className="auth-page">
			<Spinner ariaLabel="Bezig met inloggen…" />
		</Container>
	);
};

export default CallbackInner;
