'use client';

import Navigation, { type NavItem } from '@/components/structures/Navigation';
import { DASHBOARD_SECTIONS } from '@/lib/auth/dashboard-sections';
import { usePermissions } from '@/lib/auth/permissions';

// The beheer nav: the same pill/tracker Navigation as the public site, but items are filtered to the
// caller's permissions (single-sourced from DASHBOARD_SECTIONS) and the CTA is "Terug naar de website".
// A client island because item visibility depends on the live permission set (usePermissions).
const DashboardNav = () => {
	const { permissions } = usePermissions();

	const items: NavItem[] = [
		{ label: 'Dashboard', url: '/dashboard', exact: true },
		...DASHBOARD_SECTIONS.filter((section) => permissions.has(section.permission)).map((section) => ({
			label: section.navLabel,
			url: section.href,
		})),
	];

	return (
		<Navigation
			className="is-dashboard"
			brand={{ title: 'Beheer', src: '/media/dac-logo.png' }}
			items={items}
			cta={{ label: 'Terug naar de website', url: '/', target: '_self', variant: 'ghost' }}
		/>
	);
};

export default DashboardNav;
