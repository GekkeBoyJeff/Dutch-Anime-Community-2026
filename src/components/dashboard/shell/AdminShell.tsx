import type { ReactNode } from 'react';

import TermsGate from '@/app/_components/TermsGate';
import Notification from '@/components/components/Notification';
import NotificationProvider from '@/components/components/NotificationProvider';
import DashboardChrome from '@/components/dashboard/shell/DashboardChrome';

interface AdminShellProps {
	/** The routed management page */
	children?: ReactNode;
}

// The shared admin frame, reused by every management route's layout (/dashboard, /upload, …): the
// .page-frame > .page-frame-scroll nesting (the real scroll container), plus the permission-filtered
// chrome and the toast provider + outlet. Theme and colorset come from the root layout — the dashboard
// is the same DAC palette as the site, in work mode. `.is-admin` is the scope hook for that work mode:
// the denser control heights, tighter radii and layered elevation the tool surfaces opt into.
// Full-screen tools (the Puck /builder editor) deliberately do NOT use this: the fixed navbar +
// clipped frame would break their own layout.
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
