'use client';

import Button from '@/components/basics/Button';
import Icon from '@/components/basics/Icon';
import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';
import Entry from '@/components/components/Entry';
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
			<Entry.List>
				{items.map((n) => (
					<Entry
						key={n.id}
						main={n.title}
						sub={[n.body, formatDate(n.created_at, { dateStyle: 'medium', timeStyle: 'short' }) ?? n.created_at].filter(Boolean).join(' · ')}
						tone={n.read_at ? 'neutral' : 'warning'}
						marker={n.read_at ? undefined : <Icon name="bell" />}
						trailing={
							n.read_at ? undefined : (
								<Button variant="ghost" onClick={() => onMarkRead(n.id)}>
									Gelezen
								</Button>
							)
						}
					/>
				))}
			</Entry.List>
		</section>
	);
};

export default NotificationList;
