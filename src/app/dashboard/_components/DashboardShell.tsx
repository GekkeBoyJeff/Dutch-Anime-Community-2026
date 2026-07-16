'use client';

import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { DASHBOARD_SECTIONS } from '@/lib/auth/dashboard-sections';

// The staff hub. Any permission unlocks it; each section renders only if the user holds its permission.
// Signed-out → /login; signed-in with zero permissions → /account — both handled by the guard hook.
const DashboardShell = () => {
	const { ready, fallback, permissions } = useDashboardGuard(undefined, { className: 'dashboard', label: 'Dashboard laden' });
	if (!ready) return fallback;

	const visible = DASHBOARD_SECTIONS.filter((section) => permissions.has(section.permission));

	return (
		<Container className="dashboard">
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
