'use client';

import NotificationBell from '@/components/dashboard/components/NotificationBell';

import { useWidgetData } from './useWidgetData';

// Thin data wrapper around the tier NotificationBell for the hero row. Counts my own unread rows
// (notifications RLS is own-rows, read_at null = unread) and links to /account where the inbox
// already lives.
const NotificationBellWidget = () => {
	const { loading, data } = useWidgetData(async (db) => {
		const { count } = await db.from('notifications').select('id', { count: 'exact', head: true }).is('read_at', null);
		return count ?? 0;
	});

	const unread = data ?? 0;
	const label = loading ? 'Meldingen laden' : unread > 0 ? `${unread} ongelezen meldingen` : 'Geen ongelezen meldingen';

	return <NotificationBell count={unread} loading={loading} href="/account" label={label} />;
};

export default NotificationBellWidget;
