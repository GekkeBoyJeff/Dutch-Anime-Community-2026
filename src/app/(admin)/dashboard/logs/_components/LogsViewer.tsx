'use client';

import { useEffect, useMemo, useState } from 'react';

import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import DetailTabs from '@/components/components/DetailTabs';
import Drawer from '@/components/components/Drawer';
import FilterBar from '@/components/components/FilterBar';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';

type Json = Record<string, unknown> | null;
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
	old_data: Json;
	new_data: Json;
	actor_id: string | null;
	created_at: string;
}

const fmt = (iso: string): string => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });

const OP_META: Record<string, { label: string; variant: 'success' | 'info' | 'error' | 'neutral' }> = {
	INSERT: { label: 'Aangemaakt', variant: 'success' },
	UPDATE: { label: 'Gewijzigd', variant: 'info' },
	DELETE: { label: 'Verwijderd', variant: 'error' },
};

// A human label for an audit row: prefer a naming field from the row snapshot, else the short id.
const labelOf = (row: AuditRow): string => {
	const data = row.new_data ?? row.old_data;
	const pick = (data?.name ?? data?.title ?? data?.username ?? data?.summary) as string | undefined;
	return pick ?? (row.record_id ? row.record_id.slice(0, 8) : '—');
};

const fmtVal = (v: unknown): string => (v === null || v === undefined ? '—' : typeof v === 'object' ? JSON.stringify(v) : String(v));

// The field-level detail for the drawer: for an UPDATE only the changed fields (old → new); for an
// INSERT/DELETE the full snapshot.
const detailEntries = (row: AuditRow): { key: string; before?: string; after: string }[] => {
	if (row.op === 'UPDATE') {
		const keys = new Set([...Object.keys(row.old_data ?? {}), ...Object.keys(row.new_data ?? {})]);
		return [...keys]
			.filter((k) => JSON.stringify(row.old_data?.[k]) !== JSON.stringify(row.new_data?.[k]))
			.map((k) => ({ key: k, before: fmtVal(row.old_data?.[k]), after: fmtVal(row.new_data?.[k]) }));
	}
	const data = row.op === 'DELETE' ? row.old_data : row.new_data;
	return Object.entries(data ?? {}).map(([k, v]) => ({ key: k, after: fmtVal(v) }));
};

// Read-only kijkvenster: Activiteit (leesbaar domein-log, "wat er gebeurde") en Audit (technische
// rij-historie incl. cascades, met veld-diff in een detail-drawer). Beide RLS-gated op logs.view.
const LogsViewer = () => {
	const { ready, fallback, session } = useDashboardGuard('logs.view', { className: 'logs-page', label: 'Logs laden' });
	const [activity, setActivity] = useState<ActivityRow[]>([]);
	const [audit, setAudit] = useState<AuditRow[]>([]);
	const [names, setNames] = useState<Map<string, string>>(new Map());
	const [activitySearch, setActivitySearch] = useState('');
	const [auditSearch, setAuditSearch] = useState('');
	const [auditOp, setAuditOp] = useState('');
	const [auditDetail, setAuditDetail] = useState<AuditRow | null>(null);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('activity_log').select('id, kind, actor_id, summary, created_at').order('created_at', { ascending: false }).limit(300),
			db.from('audit_log').select('id, table_name, record_id, op, old_data, new_data, actor_id, created_at').order('created_at', { ascending: false }).limit(300),
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
			const matchesSearch = q === '' || r.table_name.toLowerCase().includes(q) || labelOf(r).toLowerCase().includes(q);
			const matchesOp = auditOp === '' || r.op === auditOp;
			return matchesSearch && matchesOp;
		});
	}, [audit, auditSearch, auditOp]);

	if (!ready || !session) return fallback;

	const activityColumns: DataTableColumn<ActivityRow>[] = [
		{ key: 'created_at', header: 'Wanneer', sortable: true, sortValue: (r) => r.created_at, cell: (r) => fmt(r.created_at) },
		{ key: 'summary', header: 'Wat', cell: (r) => r.summary },
		{ key: 'actor', header: 'Door', cell: (r) => actorName(r.actor_id) },
	];

	const auditColumns: DataTableColumn<AuditRow>[] = [
		{ key: 'created_at', header: 'Wanneer', sortable: true, sortValue: (r) => r.created_at, cell: (r) => fmt(r.created_at) },
		{ key: 'what', header: 'Wat', cell: (r) => labelOf(r) },
		{ key: 'table_name', header: 'Tabel', sortable: true, sortValue: (r) => r.table_name, cell: (r) => r.table_name },
		{
			key: 'op',
			header: 'Actie',
			align: 'center',
			cell: (r) => <Badge variant={OP_META[r.op]?.variant ?? 'neutral'}>{OP_META[r.op]?.label ?? r.op}</Badge>,
		},
		{ key: 'actor', header: 'Door', cell: (r) => actorName(r.actor_id) },
		{
			key: 'detail',
			header: '',
			align: 'end',
			cell: (r) => (
				<Button variant="secondary" onClick={() => setAuditDetail(r)}>
					Details
				</Button>
			),
		},
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
				searchPlaceholder="Zoek op naam of tabel…"
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

			<Drawer
				open={auditDetail !== null}
				onOpenChange={(open) => !open && setAuditDetail(null)}
				title={auditDetail ? `${labelOf(auditDetail)} — ${OP_META[auditDetail.op]?.label ?? auditDetail.op}` : 'Detail'}
				description={auditDetail ? `${auditDetail.table_name} · ${fmt(auditDetail.created_at)} · ${actorName(auditDetail.actor_id)}` : undefined}
				size="28rem"
			>
				{auditDetail && (
					<dl className="logs-detail">
						{detailEntries(auditDetail).length === 0 ? (
							<p className="logs-detail-empty">Geen veldwijzigingen.</p>
						) : (
							detailEntries(auditDetail).map((e) => (
								<div key={e.key} className="logs-detail-row">
									<dt>{e.key}</dt>
									<dd>
										{e.before !== undefined ? (
											<>
												<span className="logs-before">{e.before}</span>
												<span className="logs-arrow"> → </span>
												<span className="logs-after">{e.after}</span>
											</>
										) : (
											e.after
										)}
									</dd>
								</div>
							))
						)}
					</dl>
				)}
			</Drawer>
		</Container>
	);
};

export default LogsViewer;
