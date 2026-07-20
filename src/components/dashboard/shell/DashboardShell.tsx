'use client';

import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import { emphasisRole, orderedWidgets } from '@/components/dashboard/home/registry';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { DASHBOARD_SECTIONS } from '@/lib/auth/dashboard-sections';

import HomeHero from '../home/HomeHero';

import BeheerZone from './BeheerZone';
import DashboardHomeSkeleton from './DashboardHomeSkeleton';

// The staff hub, action-first: a greeting hero with the next-up card on top, then a personal "Voor jou"
// column beside ambient "Rondom DAC" context, and full-width "Beheer" for managers — all gated by the
// user's permissions. A user with no gated widgets still gets the hero plus plain section links, so the
// page is never a dead end.
const DashboardShell = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard(undefined, { className: 'dashboard', label: 'Dashboard laden', skeleton: <DashboardHomeSkeleton /> });
	if (!ready || !session) return fallback;

	const role = emphasisRole(permissions);
	const widgets = orderedWidgets(permissions, role);
	const personal = widgets.filter((widget) => widget.zone === 'personal');
	const ambient = widgets.filter((widget) => widget.zone === 'ambient');
	const org = widgets.filter((widget) => widget.zone === 'org');
	// Admin's Beheer-zone folds into collapsible domain groups (blueprint §1b); every other role keeps the
	// flat grid — they hold few org widgets and want them at hand, not behind a disclosure.
	const groupOrg = role === 'admin';
	const hasGatedWidget = widgets.some((widget) => widget.requiredPermission !== 'always');
	const sections = DASHBOARD_SECTIONS.filter((section) => permissions.has(section.permission));

	return (
		<Container className="dashboard">
			<HomeHero session={session} permissions={permissions} />

			<div className="home-zones">
				{personal.length > 0 && (
					<section className="widget-zone home-zone-personal">
						<Title element="h2" size={5} value="Voor jou" />
						<div className="widget-grid">
							{personal.map(({ key, component: Widget }) => (
								<Widget key={key} session={session} />
							))}
						</div>
					</section>
				)}

				{ambient.length > 0 && (
					<section className="widget-zone home-zone-ambient">
						<Title element="h2" size={5} value="Rondom DAC" />
						<div className="home-ambient-stack">
							{ambient.map(({ key, component: Widget }) => (
								<Widget key={key} session={session} />
							))}
						</div>
					</section>
				)}
			</div>

			{org.length > 0 &&
				(groupOrg ? (
					<BeheerZone widgets={org} session={session} />
				) : (
					<section className="widget-zone">
						<Title element="h2" size={5} value="Beheer" />
						<div className="widget-grid">
							{org.map(({ key, component: Widget }) => (
								<Widget key={key} session={session} />
							))}
						</div>
						{/* Widgets self-hide when they have no data; the calm line then shows via the `:empty`
						    sibling rule, so a manager's Beheer surface stays present even at zero ops data. */}
						<p className="beheer-empty">Niets wacht nu op je.</p>
					</section>
				))}

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
