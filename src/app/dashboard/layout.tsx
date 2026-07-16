import type { ReactNode } from 'react';

import DashboardChrome from '@/app/dashboard/_components/DashboardChrome';
import Notification from '@/components/components/Notification';
import NotificationProvider from '@/components/components/NotificationProvider';

import '@/app/dashboard/dashboard.scss';

interface DashboardLayoutProps {
	/** The routed dashboard page */
	children?: ReactNode;
}

// The beheer route frame: mirrors the (website) layout's .page-frame > .page-frame-scroll (the real
// scroll container) but carries the "beheer" accent scope — data-theme AND data-colorset on the same
// element, so --accent-text/--shadow-focus recompute against the beheer accent instead of the site's
// gold. Mounts the toast provider + its outlet once, so any screen beneath can fire notifications.
const DashboardLayout = ({ children }: DashboardLayoutProps) => {
	return (
		<div className="page-frame" data-theme="beheer" data-colorset="light">
			<div className="page-frame-scroll">
				<NotificationProvider>
					<DashboardChrome>{children}</DashboardChrome>
					<Notification position="bottom-right" />
				</NotificationProvider>
			</div>
		</div>
	);
};

export default DashboardLayout;
