'use client';

import Badge from '@/components/basics/Badge';
import Moment from '@/components/components/Moment';
import Panel from '@/components/components/Panel';
import { fmtDayMarker } from '@/components/dashboard/events/datetime';
import { useWidgetData } from '@/components/dashboard/home/useWidgetData';

// Ambient "Rondom DAC": the newest notification addressed to me (notifications RLS is own-rows), lifted
// out of the full list so the freshest announcement/melding reads at a glance. Read-only.
const LatestAnnouncement = () => {
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

export default LatestAnnouncement;
