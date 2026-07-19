import type { Metadata } from 'next';

import NotificationsManager from '@/app/(admin)/dashboard/notifications/_components/NotificationsManager';

import '@/app/(admin)/dashboard/inventory.scss';

export const metadata: Metadata = { title: 'Meldingen', robots: { index: false, follow: false } };

const NotificationsPage = () => <NotificationsManager />;

export default NotificationsPage;
