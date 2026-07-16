'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import { DASHBOARD_SECTIONS } from '@/lib/auth/dashboard-sections';
import { usePermissions } from '@/lib/auth/permissions';

// The staff hub. ≥1 permission unlocks the shell; each section renders only if the user holds its
// permission. Signed-out → /login; signed-in with zero permissions → /account (no dashboard access).
const DashboardShell = () => {
	const router = useRouter();
	const { permissions, loading, session } = usePermissions();

	useEffect(() => {
		if (loading) return;
		if (!session) {
			router.replace('/login?next=/dashboard');
			return;
		}
		if (permissions.size === 0) router.replace('/account');
	}, [loading, session, permissions, router]);

	if (loading || !session || permissions.size === 0) {
		return (
			<Container element="main" className="dashboard">
				<Spinner label="Dashboard laden" />
			</Container>
		);
	}

	const visible = DASHBOARD_SECTIONS.filter((section) => permissions.has(section.permission));

	return (
		<Container element="main" className="dashboard">
			<Title size={2}>Dashboard</Title>
			<div className="dashboard-grid">
				{visible.map((section) => (
					<Card
						key={section.key}
						href={section.href}
						linkLabel={section.title}
						header={<Title size={4}>{section.title}</Title>}
					>
						{section.description}
					</Card>
				))}
			</div>
		</Container>
	);
};

export default DashboardShell;
