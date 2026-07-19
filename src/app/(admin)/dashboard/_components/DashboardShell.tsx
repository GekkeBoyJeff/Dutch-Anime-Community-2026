'use client';

import { visibleWidgets } from '@/app/(admin)/dashboard/_components/home/registry';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { DASHBOARD_SECTIONS } from '@/lib/auth/dashboard-sections';

// The staff hub, action-first: personal "what's next" widgets on top, org/management below, gated
// by the user's permissions. Navigation lives in the mega-menu + bottom bar; a user with no gated
// widgets falls back to plain section links so the page is never a dead end.
const DashboardShell = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard(undefined, { className: 'dashboard', label: 'Dashboard laden' });
	if (!ready || !session) return fallback;

	const widgets = visibleWidgets(permissions);
	const personal = widgets.filter((widget) => widget.zone === 'personal');
	const org = widgets.filter((widget) => widget.zone === 'org');
	const hasGatedWidget = widgets.some((widget) => widget.requiredPermission !== 'always');
	const sections = DASHBOARD_SECTIONS.filter((section) => permissions.has(section.permission));

	return (
		<Container className="dashboard">
			<Title size={2}>Dashboard</Title>

			{personal.length > 0 && (
				<section className="widget-zone">
					<Title element="h2" size={5} value="Voor jou" />
					<div className="widget-grid">
						{personal.map(({ key, component: Widget }) => (
							<Widget key={key} session={session} />
						))}
					</div>
				</section>
			)}

			{org.length > 0 && (
				<section className="widget-zone">
					<Title element="h2" size={5} value="Beheer" />
					<div className="widget-grid">
						{org.map(({ key, component: Widget }) => (
							<Widget key={key} session={session} />
						))}
					</div>
				</section>
			)}

			{!hasGatedWidget && (
				<div className="dashboard-grid">
					{sections.map((section) => (
						<Card key={section.key} href={section.href} linkLabel={section.title} header={<Title size={4}>{section.title}</Title>}>
							{section.description}
						</Card>
					))}
				</div>
			)}
		</Container>
	);
};

export default DashboardShell;
