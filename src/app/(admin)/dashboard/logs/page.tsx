import type { Metadata } from 'next';

import LogsViewer from '@/app/(admin)/dashboard/logs/_components/LogsViewer';

import '@/app/(admin)/dashboard/dashboard.scss';

export const metadata: Metadata = { title: 'Logs', robots: { index: false, follow: false } };

const LogsPage = () => <LogsViewer />;

export default LogsPage;
