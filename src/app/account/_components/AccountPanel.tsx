'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Spinner from '@/components/basics/Spinner';
import Title from '@/components/basics/Title';
import { signOut, usePermissions } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';

// Minimal member page: profile + logout, and a link into the dashboard when the user has any access.
const AccountPanel = () => {
	const router = useRouter();
	const { permissions, loading, session } = usePermissions();
	const [username, setUsername] = useState<string | null>(null);

	useEffect(() => {
		if (loading) return;
		if (!session) {
			router.replace('/login?next=/account');
			return;
		}
		getBrowserClient()
			.from('profiles')
			.select('username')
			.eq('id', session.user.id)
			.maybeSingle()
			.then(({ data }) => setUsername((data?.username as string | null) ?? null));
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
