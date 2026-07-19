'use client';

import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Title from '@/components/basics/Title';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

interface Notification {
	id: string;
	kind: string;
	title: string;
	body: string | null;
	read_at: string | null;
	created_at: string;
}

// Eigen in-app meldingen (notifications-tabel, RLS = eigen rijen), realtime bijgewerkt. Markeer als gelezen.
const NotificationsList = ({ userId }: { userId: string }) => {
	const [items, setItems] = useState<Notification[]>([]);

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
					if (active) setItems((data ?? []) as Notification[]);
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

	if (items.length === 0) return null;
	const unread = items.filter((n) => !n.read_at).length;

	return (
		<section className="account-notifications">
			<div className="account-notifications-head">
				<Title element="h2" size={4}>Meldingen{unread > 0 ? ` (${unread})` : ''}</Title>
				{unread > 0 && (
					<Button variant="secondary" onClick={markAll}>
						Alles gelezen
					</Button>
				)}
			</div>
			<ul className="con-list">
				{items.map((n) => (
					<li key={n.id} className={n.read_at ? 'con-line' : 'con-line is-unread'}>
						<div className="con-line-info">
							<span className="con-line-main">{n.title}</span>
							{n.body && <span className="con-note">{n.body}</span>}
							<span className="con-note">{formatDate(n.created_at, { dateStyle: 'medium', timeStyle: 'short' }) ?? n.created_at}</span>
						</div>
						{!n.read_at && (
							<Button variant="ghost" onClick={() => markRead(n.id)}>
								Gelezen
							</Button>
						)}
					</li>
				))}
			</ul>
		</section>
	);
};

export default NotificationsList;
