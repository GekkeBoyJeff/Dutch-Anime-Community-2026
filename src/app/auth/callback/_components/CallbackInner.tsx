'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import { getBrowserClient } from '@/lib/supabase/client';

// Discord OAuth returns here with a `?code=`. supabase-js (detectSessionInUrl, default) exchanges it
// for a session on load; we then redirect to `next`. Entirely client-side — no server route needed.
const CallbackInner = () => {
	const router = useRouter();
	const next = useSearchParams().get('next') ?? '/dashboard';
	useEffect(() => {
		const db = getBrowserClient();
		const { data: sub } = db.auth.onAuthStateChange((_event, session) => {
			if (session) router.replace(next);
		});
		db.auth.getSession().then(({ data }) => {
			if (data.session) router.replace(next);
		});
		return () => sub.subscription.unsubscribe();
	}, [router, next]);
	return (
		<Container element="main" className="auth-page">
			<Spinner label="Bezig met inloggen…" />
		</Container>
	);
};

export default CallbackInner;
