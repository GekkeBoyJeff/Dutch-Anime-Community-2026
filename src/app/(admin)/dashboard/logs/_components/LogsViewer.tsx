'use client';

import { useEffect, useMemo, useState } from 'react';

import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import DetailTabs from '@/components/components/DetailTabs';
import FilterBar from '@/components/components/FilterBar';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';

interface ActivityRow {
	id: number;
	kind: string;
	actor_id: string | null;
	summary: string;
	created_at: string;
}
interface AuditRow {
	id: number;
	table_name: string;
	record_id: string | null;
	op: string;
	actor_id: string | null;
	created_at: string;
}

const fmt = (iso: string): string => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });

// Read-only kijkvenster op de audit-trail (audit_log: elke rij-mutatie) en het leesbare domein-log
// (activity_log). Beide zijn RLS-gated op logs.view — alleen admin ziet ze. Client-side gefilterd/gesorteerd.
const LogsViewer = () => {
	const { ready, fallback, session } = useDashboardGuard('logs.view', { className: 'logs-page', label: 'Logs laden' });
	const [activity, setActivity] = useState<ActivityRow[]>([]);
	const [audit, setAudit] = useState<AuditRow[]>([]);
	const [names, setNames] = useState<Map<string, string>>(new Map());
	const [activitySearch, setActivitySearch] = useState('');
	const [auditSearch, setAuditSearch] = useState('');
	const [auditOp, setAuditOp] = useState('');

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('activity_log').select('id, kind, actor_id, summary, created_at').order('created_at', { ascending: false }).limit(300),
			db.from('audit_log').select('id, table_name, record_id, op, actor_id, created_at').order('created_at', { ascending: false }).limit(300),
			db.from('profiles').select('id, username'),
		]).then(([{ data: act }, { data: aud }, { data: profiles }]) => {
			if (!active) return;
			setActivity((act ?? []) as ActivityRow[]);
			setAudit((aud ?? []) as AuditRow[]);
			setNames(new Map((profiles ?? []).map((p) => [p.id as string, (p.username as string | null) ?? (p.id as string).slice(0, 8)])));
		});
		return () => {
			active = false;
		};
	}, [ready, session]);

	const actorName = (id: string | null): string => (id ? names.get(id) ?? id.slice(0, 8) : 'systeem');

	const filteredActivity = useMemo(() => {
		const q = activitySearch.trim().toLowerCase();
		return activity.filter((r) => q === '' || r.summary.toLowerCase().includes(q) || r.kind.toLowerCase().includes(q));
	}, [activity, activitySearch]);

	const filteredAudit = useMemo(() => {
		const q = auditSearch.trim().toLowerCase();
		return audit.filter((r) => {
			const matchesSearch = q === '' || r.table_name.toLowerCase().includes(q);
			const matchesOp = auditOp === '' || r.op === auditOp;
			return matchesSearch && matchesOp;
		});
	}, [audit, auditSearch, auditOp]);

	if (!ready || !session) return fallback;

	const activityColumns: DataTableColumn<ActivityRow>[] = [
		{ key: 'created_at', header: 'Wanneer', sortable: true, sortValue: (r) => r.created_at, cell: (r) => fmt(r.created_at) },
		{ key: 'kind', header: 'Actie', cell: (r) => r.kind },
		{ key: 'summary', header: 'Samenvatting', cell: (r) => r.summary },
		{ key: 'actor', header: 'Door', cell: (r) => actorName(r.actor_id) },
	];

	const auditColumns: DataTableColumn<AuditRow>[] = [
		{ key: 'created_at', header: 'Wanneer', sortable: true, sortValue: (r) => r.created_at, cell: (r) => fmt(r.created_at) },
		{ key: 'table_name', header: 'Tabel', sortable: true, sortValue: (r) => r.table_name, cell: (r) => r.table_name },
		{ key: 'op', header: 'Actie', align: 'center', cell: (r) => r.op },
		{ key: 'record', header: 'Record', cell: (r) => (r.record_id ? r.record_id.slice(0, 8) : '—') },
		{ key: 'actor', header: 'Door', cell: (r) => actorName(r.actor_id) },
	];

	const activityPanel = (
		<div className="logs-tab">
			<FilterBar
				filters={[]}
				value=""
				searchable
				searchValue={activitySearch}
				onSearchValueChange={setActivitySearch}
				searchPlaceholder="Zoek in activiteit…"
				searchLabel="Zoek activiteit"
				label="Activiteit"
			/>
			<DataTable columns={activityColumns} data={filteredActivity} empty={{ title: 'Geen activiteit', description: 'Er is nog geen activiteit gelogd.' }} />
		</div>
	);

	const auditPanel = (
		<div className="logs-tab">
			<FilterBar
				filters={[
					{ label: 'Alle', value: '' },
					{ label: 'Aangemaakt', value: 'INSERT' },
					{ label: 'Gewijzigd', value: 'UPDATE' },
					{ label: 'Verwijderd', value: 'DELETE' },
				]}
				value={auditOp}
				onValueChange={setAuditOp}
				label="Filter op actie"
				searchable
				searchValue={auditSearch}
				onSearchValueChange={setAuditSearch}
				searchPlaceholder="Zoek op tabel…"
				searchLabel="Zoek audit"
			/>
			<DataTable columns={auditColumns} data={filteredAudit} empty={{ title: 'Geen audit-regels', description: 'Er zijn nog geen wijzigingen gelogd.' }} />
		</div>
	);

	return (
		<Container className="logs-page">
			<Title size={2}>Logs</Title>
			<DetailTabs
				label="Logs"
				tabs={[
					{ label: 'Activiteit', panel: activityPanel },
					{ label: 'Audit', panel: auditPanel },
				]}
			/>
		</Container>
	);
};

export default LogsViewer;
