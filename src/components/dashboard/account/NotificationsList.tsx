'use client';

import { useEffect, useState } from 'react';

import NotificationList, { type NotificationItem } from '@/components/dashboard/components/NotificationList';
import { getBrowserClient } from '@/lib/supabase/client';

// Eigen in-app meldingen (notifications-tabel, RLS = eigen rijen), realtime bijgewerkt. Owns the
// query + realtime subscription + mutations; components/NotificationList is the presentational list.
const NotificationsList = ({ userId }: { userId: string }) => {
	const [items, setItems] = useState<NotificationItem[] | null>(null);

	useEffect(() => {
		const db = getBrowserClient();
		let active = true;
		const load = () =>
			db
				.from('notifications')
				.select('id, kind, title, body, read_at, created_at')
				.order('created_at', { ascending: false })
				.limit(30)
				.then(({ data }) => {
					if (active) setItems((data ?? []) as NotificationItem[]);
				});
		load();
		const channel = db
			.channel(`notifications-${userId}`)
			.on('postgres_changes', { event: '*', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` }, () => load())
			.subscribe();
		return () => {
			active = false;
			db.removeChannel(channel);
		};
	}, [userId]);

	const markRead = async (id: string) => {
		await getBrowserClient().from('notifications').update({ read_at: new Date().toISOString() }).eq('id', id);
	};
	const markAll = async () => {
		await getBrowserClient().from('notifications').update({ read_at: new Date().toISOString() }).is('read_at', null);
	};

	return <NotificationList items={items} onMarkRead={markRead} onMarkAll={markAll} />;
};

export default NotificationsList;
