import type { Metadata } from 'next';

import NotificationsManager from '@/components/dashboard/notifications/NotificationsManager';

export const metadata: Metadata = { title: 'Meldingen', robots: { index: false, follow: false } };

const NotificationsPage = () => <NotificationsManager />;

export default NotificationsPage;
