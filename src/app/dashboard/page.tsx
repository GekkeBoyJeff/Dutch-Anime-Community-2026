import type { Metadata } from 'next';

import DashboardShell from '@/app/dashboard/_components/DashboardShell';

import '@/app/dashboard/dashboard.scss';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

const DashboardPage = () => <DashboardShell />;

export default DashboardPage;
