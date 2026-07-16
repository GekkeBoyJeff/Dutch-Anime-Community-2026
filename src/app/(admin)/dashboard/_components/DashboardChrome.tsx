import type { ReactNode } from 'react';

import DashboardNav from '@/app/(admin)/dashboard/_components/DashboardNav';

interface DashboardChromeProps {
	/** The routed dashboard page */
	children?: ReactNode;
}

// The beheer shell, mirroring SiteChrome (skip-link + Navigation) but with the permission-filtered
// dashboard nav and a single <main id="main"> the skip-link targets. No footer/announcement-bar — a
// focused admin surface. Server component; DashboardNav below is the only client island.
const DashboardChrome = ({ children }: DashboardChromeProps) => {
	return (
		<>
			<a className="skip-link" href="#main">
				Ga naar de inhoud
			</a>
			<DashboardNav />
			<main id="main" tabIndex={-1} className="dashboard-main">
				{children}
			</main>
		</>
	);
};

export default DashboardChrome;
