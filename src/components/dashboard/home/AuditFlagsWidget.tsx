'use client';

import Badge from '@/components/basics/Badge';
import DetailRow from '@/components/dashboard/components/DetailRow';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

const OP_META: Record<string, { label: string; variant: 'success' | 'info' | 'error' | 'neutral' }> = {
	INSERT: { label: 'Aangemaakt', variant: 'success' },
	UPDATE: { label: 'Gewijzigd', variant: 'info' },
	DELETE: { label: 'Verwijderd', variant: 'error' },
};

const fmt = (iso: string): string => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });

// audit_log's table_name is a raw Postgres identifier (e.g. "event_ticket_subjects") — humanize it for
// display instead of maintaining a per-table translation list.
const humanizeTable = (name: string): string => {
	const spaced = name.replace(/_/g, ' ');
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

// A human label for an audit row: prefer a naming field from the row snapshot, else the table it's in
// (never the raw record id — a UUID prefix means nothing to the reader).
const labelOf = (row: { new_data: unknown; old_data: unknown; table_name: string }): string => {
	const data = (row.new_data ?? row.old_data) as Record<string, unknown> | null;
	const pick = (data?.name ?? data?.title ?? data?.username) as string | undefined;
	return pick ?? humanizeTable(row.table_name);
};

// The latest audit-log entries, for staff with logs.view. A compact echo of LogsViewer's Audit tab —
// what changed, in which table, when — deep-linking to the full log. Fetches more than the display
// limit so repeated edits to the same record (e.g. autosave) can be collapsed to their latest row.
const AuditFlagsWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db
			.from('audit_log')
			.select('id, table_name, record_id, op, old_data, new_data, created_at')
			.order('created_at', { ascending: false })
			.limit(20);
		if (queryError) throw queryError;
		if (!rows || rows.length === 0) return null;

		const seen = new Set<string>();
		const deduped = rows.filter((row) => {
			const key = `${row.table_name}:${row.record_id}`;
			if (seen.has(key)) return false;
			seen.add(key);
			return true;
		});
		return deduped.slice(0, 6);
	});

	return (
		<AsyncCard title="Recente wijzigingen" href="/dashboard/logs" linkLabel="Naar logs" loading={loading} error={error} isEmpty={!data} hideWhenEmpty>
			{data && (
				<ul className="widget-list">
					{data.map((row) => (
						<DetailRow
							key={row.id}
							main={labelOf(row)}
							sub={`${humanizeTable(row.table_name)} · ${fmt(row.created_at)}`}
							trailing={<Badge variant={OP_META[row.op]?.variant ?? 'neutral'}>{OP_META[row.op]?.label ?? row.op}</Badge>}
						/>
					))}
				</ul>
			)}
		</AsyncCard>
	);
};

export default AuditFlagsWidget;
