'use client';

import Timeline from '@/components/components/Timeline';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Ambient "Rondom DAC" mini-timeline: the next few conventions on the calendar. Reads the same events
// table the convention widgets use (RLS gates it on inventory.view — the registry matches), newest-first
// upcoming. Read-only context everyone with view enjoys but no one must act on. Renders through the
// tier Timeline component, one side of the rail (`align="left"`), each event a headingLevel-4 milestone
// nested under this card's own h3.
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
		<AsyncCard
			title="Aankomende events"
			href="/dashboard/events"
			linkLabel="Naar conventies"
			loading={loading}
			error={error}
			isEmpty={!data}
			emptyLabel="Nog niets op de kalender — tijd om iets te plannen."
		>
			{data && (
				<Timeline
					align="left"
					headingLevel={4}
					items={data.map((event) => ({
						year: event.starts_on ? (formatDate(event.starts_on, { day: 'numeric', month: 'long' }) ?? event.starts_on) : 'Datum onbekend',
						title: event.name,
						text: event.location ?? undefined,
					}))}
				/>
			)}
		</AsyncCard>
	);
};

export default EventsTimelineWidget;
