import type { ReactNode } from 'react';

import AdminShell from '@/components/dashboard/shell/AdminShell';

type AdminLayoutProps = { children: ReactNode };

const AdminLayout = ({ children }: AdminLayoutProps) => <AdminShell>{children}</AdminShell>;

export default AdminLayout;
