'use client';

import Entry from '@/components/components/Entry';
import Panel from '@/components/components/Panel';
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
		<Panel
			title={total > 0 ? `Onbezette shifts (${total})` : 'Team-status'}
			href="/dashboard/team"
			linkLabel="Naar team"
			error={error}
			isEmpty={!loading && total === 0}
			hideWhenEmpty
		>
			<Entry.List>
				{loading && [0, 1, 2].map((row) => <Entry key={row} main="" loading />)}
				{data && total > 0 &&
					data.slice(0, 4).map((event) => (
						<Entry
							key={event.id}
							main={event.name}
							sub={event.starts_on ? formatDate(event.starts_on, { dateStyle: 'medium' }) ?? event.starts_on : 'Datum onbekend'}
							href={`/dashboard/events?id=${event.id}`}
							tone={event.open > 4 ? 'negative' : 'warning'}
							trailing={`${event.open} open`}
						/>
					))}
			</Entry.List>
		</Panel>
	);
};

export default TeamStatusWidget;
