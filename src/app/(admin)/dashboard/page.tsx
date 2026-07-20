import type { Metadata } from 'next';

import DashboardShell from '@/components/dashboard/shell/DashboardShell';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

const DashboardPage = () => <DashboardShell />;

export default DashboardPage;
