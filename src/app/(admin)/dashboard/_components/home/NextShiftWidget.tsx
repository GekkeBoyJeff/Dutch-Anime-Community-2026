'use client';

import { fmtRange } from '@/app/(admin)/dashboard/events/_components/datetime';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';
import WidgetShell from './WidgetShell';

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
		<WidgetShell
			title="Volgende shift"
			href="/dashboard/my-inventory"
			linkLabel="Naar mijn conventies"
			loading={loading}
			error={error}
			isEmpty={!data}
			emptyLabel="Nog geen shifts toegewezen."
		>
			{data && (
				<div className="widget-lead">
					<span className="widget-lead-main">{fmtRange(data.shift.starts_at, data.shift.ends_at)}</span>
					<span className="widget-lead-sub">
						{data.eventName}
						{data.shift.station ? ` · ${data.shift.station}` : ''}
					</span>
				</div>
			)}
		</WidgetShell>
	);
};

export default NextShiftWidget;
