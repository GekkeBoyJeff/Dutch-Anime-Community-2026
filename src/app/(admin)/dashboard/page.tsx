import type { Metadata } from 'next';

import DashboardShell from '@/app/(admin)/dashboard/_components/DashboardShell';

import '@/app/(admin)/dashboard/dashboard.scss';

export const metadata: Metadata = { title: 'Dashboard', robots: { index: false, follow: false } };

const DashboardPage = () => <DashboardShell />;

export default DashboardPage;
