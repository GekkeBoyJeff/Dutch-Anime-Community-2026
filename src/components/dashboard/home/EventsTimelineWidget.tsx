'use client';

import Moment from '@/components/components/Moment';
import Panel from '@/components/components/Panel';
import { fmtDayMarker } from '@/components/dashboard/events/datetime';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Ambient "Rondom DAC" mini-timeline: the next few conventions on the calendar. Reads the same events
// table the convention widgets use (RLS gates it on inventory.view — the registry matches), newest-first
// upcoming. Read-only context everyone with view enjoys but no one must act on.
const EventsTimelineWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db
			.from('events')
			.select('id, name, location, starts_on')
			.is('archived_at', null)
			.gte('starts_on', new Date().toISOString().slice(0, 10))
			.order('starts_on', { ascending: true })
			.limit(4);
		if (queryError) throw queryError;
		return rows && rows.length > 0 ? rows : null;
	});

	return (
		<Panel
			title="Aankomende events"
			href="/dashboard/events"
			linkLabel="Naar conventies"
			error={error}
			isEmpty={!loading && !data}
			emptyLabel="Nog niets op de kalender — tijd om iets te plannen."
		>
			<Moment.List>
				{loading && [0, 1, 2].map((row) => <Moment key={row} marker="" title="" loading />)}
				{data?.map((event) => (
					<Moment
						key={event.id}
						marker={event.starts_on ? fmtDayMarker(event.starts_on) : 'Onbekend'}
						title={event.name}
						meta={event.location ?? undefined}
					/>
				))}
			</Moment.List>
		</Panel>
	);
};

export default EventsTimelineWidget;
