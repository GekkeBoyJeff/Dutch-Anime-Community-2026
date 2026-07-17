'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Spinner from '@/components/basics/Spinner';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import { signOut, usePermissions } from '@/lib/auth/permissions';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

interface MyWarning {
	color: string;
	reason: string;
	issued_at: string;
}

// Minimal member page: profile + logout, and a link into the dashboard when the user has any access.
const AccountPanel = () => {
	const router = useRouter();
	const { permissions, loading, session } = usePermissions();
	const [username, setUsername] = useState<string | null>(null);
	const [warnings, setWarnings] = useState<MyWarning[]>([]);

	useEffect(() => {
		if (loading) return;
		if (!session) {
			router.replace('/login?next=/account');
			return;
		}
		const db = getBrowserClient();
		db.from('profiles')
			.select('username')
			.eq('id', session.user.id)
			.maybeSingle()
			.then(({ data }) => setUsername((data?.username as string | null) ?? null));
		// Eigen actieve warnings (kolom-afgeschermde RPC: alleen kleur/reden/datum, volgt merges).
		db.rpc('my_warnings').then(({ data }) => setWarnings((data ?? []) as MyWarning[]));
	}, [loading, session, router]);

	if (loading || !session) {
		return (
			<Container element="main" className="auth-page">
				<Spinner label="Account laden" />
			</Container>
		);
	}

	return (
		<Container element="main" className="auth-page">
			<Title size={2}>Account</Title>
			<Content element="p">Ingelogd als {username ?? session.user.email ?? 'gebruiker'}.</Content>

			{warnings.length > 0 && (
				<section className="account-warnings">
					<Title element="h2" size={4}>Mijn warnings</Title>
					<ul className="con-list">
						{warnings.map((w, i) => (
							<li key={i} className="con-line">
								<div className="con-line-info">
									<span className="con-line-main">{w.reason}</span>
									<span className="con-note">{formatDate(w.issued_at, { dateStyle: 'medium' }) ?? w.issued_at}</span>
								</div>
								<StatusBadge domain="warning" status={w.color} />
							</li>
						))}
					</ul>
				</section>
			)}

			{permissions.size > 0 && (
				<Button variant="primary" url="/dashboard">
					Naar dashboard
				</Button>
			)}
			<Button
				variant="secondary"
				icon="logout"
				onClick={async () => {
					await signOut();
					router.replace('/');
				}}
			>
				Uitloggen
			</Button>
		</Container>
	);
};

export default AccountPanel;
