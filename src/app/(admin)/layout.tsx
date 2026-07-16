import type { ReactNode } from 'react';

import AdminShell from '@/app/(admin)/dashboard/_components/AdminShell';

import '@/app/(admin)/dashboard/dashboard.scss';

interface AdminLayoutProps {
	/** The routed management page */
	children?: ReactNode;
}

// Shared layout for every management route (/dashboard, /upload, …), grouped under (admin) so
// AdminShell — and its permission-filtered navbar — mounts ONCE and persists across navigations
// between them (no re-mount, no flicker). /builder stays outside the group: it's a full-screen editor.
const AdminLayout = ({ children }: AdminLayoutProps) => <AdminShell>{children}</AdminShell>;

export default AdminLayout;
