'use client';

import Moment from '@/components/components/Moment';
import Panel from '@/components/components/Panel';
import { fmtDayMarker, fmtRange } from '@/components/dashboard/events/datetime';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Your next stand-duty shift. Reuses MyInventory's idiom: my_subject_id() → event_shifts scoped to
// that subject; RLS already lets a member read their own shifts, so this answers "my next shift" today.
const NextShiftWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: subjectId, error: subjectError } = await db.rpc('my_subject_id');
		if (subjectError) throw subjectError;
		if (!subjectId) return null;

		const { data: shifts, error: shiftError } = await db
			.from('event_shifts')
			.select('id, event_id, starts_at, ends_at, station')
			.eq('subject_id', subjectId)
			.gte('starts_at', new Date().toISOString())
			.order('starts_at')
			.limit(1);
		if (shiftError) throw shiftError;

		const shift = shifts?.[0];
		if (!shift) return null;

		const { data: event } = await db.from('events').select('name').eq('id', shift.event_id).maybeSingle();
		return { shift, eventName: event?.name ?? 'Onbekende conventie' };
	});

	return (
		<Panel
			title="Volgende shift"
			href="/dashboard/my-inventory"
			linkLabel="Naar mijn conventies"
			error={error}
			isEmpty={!loading && !data}
			emptyLabel="Nog geen shifts toegewezen."
		>
			<Moment.List>
				<Moment
					marker={data ? fmtDayMarker(data.shift.starts_at) : ''}
					title={data ? fmtRange(data.shift.starts_at, data.shift.ends_at) : ''}
					meta={data ? `${data.eventName}${data.shift.station ? ` · ${data.shift.station}` : ''}` : undefined}
					state="upcoming"
					loading={loading}
				/>
			</Moment.List>
		</Panel>
	);
};

export default NextShiftWidget;
