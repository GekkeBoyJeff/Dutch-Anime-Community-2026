'use client';

import Interactive from '@/components/basics/Interactive';
import DetailRow from '@/components/dashboard/components/DetailRow';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Team-status (blueprint §1b/C6): the unfilled shifts across upcoming conventions, for staff managers.
// Reads the same event_shifts rows the Agenda tab owns, folded to an open-count per convention and sorted
// by date, deep-linking straight into each event's editor. No new data.
const TeamStatusWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const today = new Date().toISOString().slice(0, 10);
		const { data: events, error: eventsError } = await db
			.from('events')
			.select('id, name, starts_on')
			.is('archived_at', null)
			.gte('starts_on', today)
			.order('starts_on', { ascending: true })
			.limit(6);
		if (eventsError) throw eventsError;
		if (!events || events.length === 0) return [];

		const eventIds = events.map((event) => event.id);
		const { data: shifts, error: shiftsError } = await db.from('event_shifts').select('event_id, subject_id').in('event_id', eventIds);
		if (shiftsError) throw shiftsError;

		const openByEvent = new Map<string, number>();
		for (const shift of shifts ?? []) {
			if (shift.subject_id === null) openByEvent.set(shift.event_id, (openByEvent.get(shift.event_id) ?? 0) + 1);
		}
		return events
			.map((event) => ({ ...event, open: openByEvent.get(event.id) ?? 0 }))
			.filter((event) => event.open > 0);
	});

	const total = data?.reduce((sum, event) => sum + event.open, 0) ?? 0;

	return (
		<AsyncCard
			title={total > 0 ? `Onbezette shifts (${total})` : 'Team-status'}
			href="/dashboard/team"
			linkLabel="Naar team"
			loading={loading}
			error={error}
			isEmpty={total === 0}
			hideWhenEmpty
		>
			{data && total > 0 && (
				<ul className="widget-list">
					{data.slice(0, 4).map((event) => (
						<DetailRow
							key={event.id}
							main={<Interactive url={`/dashboard/events?id=${event.id}`}>{event.name}</Interactive>}
							sub={event.starts_on ? formatDate(event.starts_on, { dateStyle: 'medium' }) ?? event.starts_on : 'Datum onbekend'}
							trailing={<span className="detail-row-amount">{event.open} open</span>}
						/>
					))}
				</ul>
			)}
		</AsyncCard>
	);
};

export default TeamStatusWidget;
