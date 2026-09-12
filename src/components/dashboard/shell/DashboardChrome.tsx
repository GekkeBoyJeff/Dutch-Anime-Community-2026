import type { ReactNode } from 'react';

import DashboardNav from '@/components/dashboard/shell/DashboardNav';
import RouteReveal from '@/components/dashboard/structures/RouteReveal';

import '@/styles/components/dashboard/shell/DashboardChrome.scss';

interface DashboardChromeProps {
	children?: ReactNode;
}

const DashboardChrome = ({ children }: DashboardChromeProps) => {
	return (
		<>
			<a className="skip-link" href="#main">
				Ga naar de inhoud
			</a>
			<DashboardNav />
			<main id="main" tabIndex={-1} className="dashboard-chrome-dashboard-main">
				<RouteReveal>{children}</RouteReveal>
			</main>
		</>
	);
};

export default DashboardChrome;
