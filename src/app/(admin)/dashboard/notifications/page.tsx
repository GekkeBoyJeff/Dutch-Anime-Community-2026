import type { Metadata } from 'next';

import NotificationsComposer from '@/app/(admin)/dashboard/notifications/_components/NotificationsComposer';

import '@/app/(admin)/dashboard/inventory.scss';

export const metadata: Metadata = { title: 'Meldingen', robots: { index: false, follow: false } };

const NotificationsPage = () => <NotificationsComposer />;

export default NotificationsPage;
