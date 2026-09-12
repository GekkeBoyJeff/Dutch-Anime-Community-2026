import type { ReactNode } from 'react';

import TermsGate from '@/app/_components/TermsGate';
import Notification from '@/components/components/Notification/Notification';
import NotificationProvider from '@/components/components/NotificationProvider/NotificationProvider';
import DashboardChrome from '@/components/dashboard/shell/DashboardChrome/DashboardChrome';

interface AdminShellProps {
	children?: ReactNode;
}

const AdminShell = ({ children }: AdminShellProps) => {
	return (
		<div className="page-frame is-admin">
			<div className="page-frame-scroll">
				<NotificationProvider>
					<DashboardChrome>
						<TermsGate>{children}</TermsGate>
					</DashboardChrome>
					<Notification position="bottom-right" />
				</NotificationProvider>
			</div>
		</div>
	);
};

export default AdminShell;
