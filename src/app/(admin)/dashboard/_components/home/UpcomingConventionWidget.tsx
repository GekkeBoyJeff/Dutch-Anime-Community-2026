'use client';

import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';
import WidgetShell from './WidgetShell';

// The next convention on the calendar, for staff who manage inventory/conventions. Deep links straight
// into that event's editor. Gated on inventory.manage (registry); RLS re-checks on the events read.
const UpcomingConventionWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db
			.from('events')
			.select('id, name, location, starts_on')
			.is('archived_at', null)
			.gte('starts_on', new Date().toISOString().slice(0, 10))
			.order('starts_on', { ascending: true })
			.limit(1);
		if (queryError) throw queryError;
		return rows?.[0] ?? null;
	});

	return (
		<WidgetShell
			title="Volgende conventie"
			href={data ? `/dashboard/events?id=${data.id}` : undefined}
			linkLabel="Open conventie"
			loading={loading}
			error={error}
			isEmpty={!data}
			hideWhenEmpty
		>
			{data && (
				<div className="widget-lead">
					<span className="widget-lead-main">{data.name}</span>
					<span className="widget-lead-sub">
						{data.starts_on ? formatDate(data.starts_on, { dateStyle: 'full' }) ?? data.starts_on : 'Datum onbekend'}
						{data.location ? ` · ${data.location}` : ''}
					</span>
				</div>
			)}
		</WidgetShell>
	);
};

export default UpcomingConventionWidget;
