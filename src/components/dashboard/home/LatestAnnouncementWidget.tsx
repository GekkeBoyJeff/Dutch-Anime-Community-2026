'use client';

import Badge from '@/components/basics/Badge';
import Moment from '@/components/components/Moment';
import Panel from '@/components/components/Panel';
import { fmtDayMarker } from '@/components/dashboard/events/datetime';

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
		<Panel
			title="Laatste melding"
			href="/account"
			linkLabel="Naar meldingen"
			error={error}
			isEmpty={!loading && !data}
			emptyLabel="Nog geen meldingen — je bent helemaal bij."
		>
			<Moment.List>
				<Moment
					marker={data ? fmtDayMarker(data.created_at) : ''}
					title={data?.title ?? ''}
					meta={data?.body ?? undefined}
					state="now"
					trailing={data?.read_at === null ? <Badge variant="info">Nieuw</Badge> : undefined}
					loading={loading}
				/>
			</Moment.List>
		</Panel>
	);
};

export default LatestAnnouncementWidget;
