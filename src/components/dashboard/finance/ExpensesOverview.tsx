'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import Metric from '@/components/components/Metric';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';
import DataTableSkeleton from '@/components/dashboard/components/DataTableSkeleton';
import { categoryLabel, type Expense, formatEur, isCommittedSpend, quarterOf } from '@/lib/expenses/types';
import { getBrowserClient } from '@/lib/supabase/client';

interface EventInfo {
	id: string;
	name: string;
	budget_eur: number | null;
}
interface GroupRow {
	label: string;
	committed: number;
	pending: number;
}
interface ConRow extends GroupRow {
	budget: number | null;
	remaining: number | null;
}

const NO_CON = 'Geen conventie';

// Mirrors each group table's columns so the loading placeholders reserve the same table shape.
const GROUP_SKELETON_COLUMNS = [{ header: '' }, { header: 'Besteed', align: 'end' as const }, { header: 'In behandeling', align: 'end' as const }];
const CON_SKELETON_COLUMNS = [
	{ header: 'Conventie' },
	{ header: 'Budget', align: 'end' as const },
	{ header: 'Besteed', align: 'end' as const },
	{ header: 'In behandeling', align: 'end' as const },
	{ header: 'Resterend', align: 'end' as const },
];

// Uitgaven-overzicht (expenses.manage): wat DAC heeft uitgegeven — totaal, per jaar, per kwartaal, per
// conventie (incl. budget/resterend) en per categorie. "Besteed" = goedgekeurd + uitbetaald; ingediend telt
// als "in behandeling". Read-only aggregatie, client-side.
const ExpensesOverview = () => {
	const toast = Toast.useToastManager();
	const [expenses, setExpenses] = useState<Expense[] | null>(null);
	const [events, setEvents] = useState<EventInfo[]>([]);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('expenses').select('*').is('archived_at', null),
			db.from('events').select('id, name, budget_eur'),
		]).then((res) => {
			if (!active) return;
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon overzicht niet laden', description: failed.message, type: 'error' });
				return;
			}
			const [{ data: rows }, { data: eventRows }] = res;
			setExpenses((rows ?? []) as Expense[]);
			setEvents((eventRows ?? []) as EventInfo[]);
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const grand = useMemo(() => {
		let committed = 0;
		let pending = 0;
		for (const e of expenses ?? []) {
			if (isCommittedSpend(e.status)) committed += Number(e.amount_eur);
			else if (e.status === 'submitted') pending += Number(e.amount_eur);
		}
		return { committed, pending };
	}, [expenses]);

	// Groepeer op een sleutel → {committed, pending}. Sorteer op besteed (aflopend).
	const groupBy = (key: (e: Expense) => string): GroupRow[] => {
		const map = new Map<string, GroupRow>();
		for (const e of expenses ?? []) {
			const k = key(e);
			const row = map.get(k) ?? { label: k, committed: 0, pending: 0 };
			if (isCommittedSpend(e.status)) row.committed += Number(e.amount_eur);
			else if (e.status === 'submitted') row.pending += Number(e.amount_eur);
			map.set(k, row);
		}
		return [...map.values()].sort((a, b) => b.committed - a.committed);
	};

	const byYear = useMemo(() => groupBy((e) => e.incurred_on.slice(0, 4)).sort((a, b) => b.label.localeCompare(a.label)), [expenses]);
	const byQuarter = useMemo(() => groupBy((e) => quarterOf(e.incurred_on)).sort((a, b) => b.label.localeCompare(a.label)), [expenses]);
	const byCategory = useMemo(() => groupBy((e) => categoryLabel(e.category)), [expenses]);

	const byConference = useMemo<ConRow[]>(() => {
		const names = new Map(events.map((ev) => [ev.id, ev.name]));
		const budgets = new Map(events.map((ev) => [ev.id, ev.budget_eur]));
		const map = new Map<string, ConRow>();
		for (const e of expenses ?? []) {
			// Sleutel op event_id (niet op naam): twee verschillende cons met dezelfde naam blijven zo
			// gescheiden met hun eigen budget; verweesde/naamloze declaraties vallen samen onder NO_CON.
			const key = e.event_id && names.has(e.event_id) ? e.event_id : NO_CON;
			const label = key === NO_CON ? NO_CON : names.get(key) ?? NO_CON;
			const budget = key === NO_CON ? null : budgets.get(key) ?? null;
			const row = map.get(key) ?? { label, committed: 0, pending: 0, budget, remaining: null };
			if (isCommittedSpend(e.status)) row.committed += Number(e.amount_eur);
			else if (e.status === 'submitted') row.pending += Number(e.amount_eur);
			map.set(key, row);
		}
		return [...map.values()]
			.map((r) => ({ ...r, remaining: r.budget !== null ? r.budget - r.committed : null }))
			.sort((a, b) => b.committed - a.committed);
	}, [expenses, events]);

	const groupColumns: DataTableColumn<GroupRow>[] = useMemo(
		() => [
			{ key: 'label', header: '', sortable: true, sortValue: (r) => r.label, cell: (r) => r.label },
			{ key: 'committed', header: 'Besteed', align: 'end', sortable: true, sortValue: (r) => r.committed, cell: (r) => formatEur(r.committed) },
			{ key: 'pending', header: 'In behandeling', align: 'end', sortable: true, sortValue: (r) => r.pending, cell: (r) => formatEur(r.pending) },
		],
		[],
	);

	const conColumns: DataTableColumn<ConRow>[] = useMemo(
		() => [
			{ key: 'label', header: 'Conventie', sortable: true, sortValue: (r) => r.label, cell: (r) => r.label },
			{ key: 'budget', header: 'Budget', align: 'end', cell: (r) => (r.budget !== null ? formatEur(r.budget) : '—') },
			{ key: 'committed', header: 'Besteed', align: 'end', sortable: true, sortValue: (r) => r.committed, cell: (r) => formatEur(r.committed) },
			{ key: 'pending', header: 'In behandeling', align: 'end', cell: (r) => formatEur(r.pending) },
			{
				key: 'remaining',
				header: 'Resterend',
				align: 'end',
				cell: (r) => (r.remaining !== null ? <StatusBadge domain="expense" status={r.remaining < 0 ? 'rejected' : 'approved'} label={formatEur(r.remaining)} /> : '—'),
			},
		],
		[],
	);

	const loading = expenses === null;

	return (
		<div className="inventory-tab expenses-overview">
			<div className="metric-row">
				<Metric label="Totaal besteed (goedgekeurd + uitbetaald)" value={formatEur(grand.committed)} loading={loading} />
				<Metric label="Totaal in behandeling (ingediend)" value={formatEur(grand.pending)} loading={loading} />
			</div>

			<Title element="h3" size={5}>Per conventie</Title>
			{loading ? (
				<DataTableSkeleton columns={CON_SKELETON_COLUMNS} fallbackRows={4} />
			) : (
				<div className="reveal">
					<DataTable columns={conColumns} data={byConference} empty={{ title: 'Nog geen uitgaven', description: 'Er zijn nog geen declaraties.' }} />
				</div>
			)}

			<Title element="h3" size={5}>Per jaar</Title>
			{loading ? (
				<DataTableSkeleton columns={GROUP_SKELETON_COLUMNS} fallbackRows={3} />
			) : (
				<div className="reveal">
					<DataTable columns={groupColumns} data={byYear} empty={{ title: 'Geen data', description: '' }} />
				</div>
			)}

			<Title element="h3" size={5}>Per kwartaal</Title>
			{loading ? (
				<DataTableSkeleton columns={GROUP_SKELETON_COLUMNS} fallbackRows={4} />
			) : (
				<div className="reveal">
					<DataTable columns={groupColumns} data={byQuarter} empty={{ title: 'Geen data', description: '' }} />
				</div>
			)}

			<Title element="h3" size={5}>Per categorie</Title>
			{loading ? (
				<DataTableSkeleton columns={GROUP_SKELETON_COLUMNS} fallbackRows={5} />
			) : (
				<div className="reveal">
					<DataTable columns={groupColumns} data={byCategory} empty={{ title: 'Geen data', description: '' }} />
				</div>
			)}
		</div>
	);
};

export default ExpensesOverview;
