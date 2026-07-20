import type { Metadata } from 'next';

import LogsViewer from '@/components/dashboard/logs/LogsViewer';

export const metadata: Metadata = { title: 'Logs', robots: { index: false, follow: false } };

const LogsPage = () => <LogsViewer />;

export default LogsPage;
