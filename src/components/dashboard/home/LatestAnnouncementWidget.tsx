'use client';

import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Ambient "Rondom DAC": the newest notification addressed to me (notifications RLS is own-rows), so the
// latest announcement/melding surfaces on the home without opening /account. Read-only.
const LatestAnnouncementWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db
			.from('notifications')
			.select('id, title, body, created_at, read_at')
			.order('created_at', { ascending: false })
			.limit(1);
		if (queryError) throw queryError;
		return rows?.[0] ?? null;
	});

	return (
		<AsyncCard
			title="Laatste melding"
			href="/account"
			linkLabel="Naar meldingen"
			loading={loading}
			error={error}
			isEmpty={!data}
			emptyLabel="Nog geen meldingen — je bent helemaal bij."
		>
			{data && (
				<div className="home-announce" data-unread={data.read_at === null || undefined}>
					<span className="home-announce-title">{data.title}</span>
					{data.body && <span className="home-announce-body">{data.body}</span>}
					<span className="home-announce-when">{formatDate(data.created_at, { dateStyle: 'medium' }) ?? data.created_at}</span>
				</div>
			)}
		</AsyncCard>
	);
};

export default LatestAnnouncementWidget;
