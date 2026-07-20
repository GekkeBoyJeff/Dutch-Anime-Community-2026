'use client';

import Button from '@/components/basics/Button';
import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';
import { formatDate } from '@/lib/formatDate';

export interface NotificationItem {
	id: string;
	kind: string;
	title: string;
	body: string | null;
	read_at: string | null;
	created_at: string;
}

export interface NotificationListProps {
	/** `null` while the list is loading */
	items: NotificationItem[] | null;
	onMarkRead: (id: string) => void;
	onMarkAll: () => void;
}

// Presentational own-notifications list ("Meldingen"): a header with the unread count and a
// mark-all-read action, then a compact list per item with a per-row mark-read. Renders nothing once
// resolved empty — the caller (a realtime-subscribed wrapper) owns the query and mutations.
const NotificationList = ({ items, onMarkRead, onMarkAll }: NotificationListProps) => {
	if (items === null) {
		return (
			<section className="account-notifications" aria-hidden="true">
				<Skeleton width="40%" height="1.1rem" />
				<Skeleton width="100%" height="2.5rem" radius="m" />
			</section>
		);
	}
	if (items.length === 0) return null;
	const unread = items.filter((n) => !n.read_at).length;

	return (
		<section className="account-notifications reveal">
			<div className="account-notifications-head">
				<Title element="h2" size={4}>Meldingen{unread > 0 ? ` (${unread})` : ''}</Title>
				{unread > 0 && (
					<Button variant="secondary" onClick={onMarkAll}>
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
							<Button variant="ghost" onClick={() => onMarkRead(n.id)}>
								Gelezen
							</Button>
						)}
					</li>
				))}
			</ul>
		</section>
	);
};

export default NotificationList;
