'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import BarBreakdown from '@/app/(admin)/dashboard/finance/_components/BarBreakdown';
import Alert from '@/components/basics/Alert';
import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { CATEGORY_OPTIONS, categoryLabel, formatEur, isCommittedSpend } from '@/lib/expenses/types';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type FinanceRow = Database['public']['Functions']['finance_rollup']['Returns'][number];

const BRON_LABELS: Record<string, string> = { kosten: 'Kosten (conventie)', declaratie: 'Declaratie (los)' };

// Besteed (goedgekeurd + uitbetaald) opgeteld per groepssleutel, aflopend gesorteerd — voedt de balken.
const committedBy = (source: FinanceRow[], key: (r: FinanceRow) => string): { label: string; amount: number }[] => {
	const map = new Map<string, number>();
	for (const r of source) {
		if (!isCommittedSpend(r.status)) continue;
		map.set(key(r), (map.get(key(r)) ?? 0) + Number(r.bedrag));
	}
	return [...map.entries()].map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount);
};

// Org-brede Financiën (expenses.manage): één rollup over al het geld dat DAC uitgeeft. Haalt de vlakke
// finance_rollup-dataset op (RLS/RPC is de grens; de guard is UX) en filtert + aggregeert client-side —
// bij DAC's rij-aantallen sneller dan per filterwissel opnieuw op te halen. Inkomsten zijn (nog) niet
// in het schema te representeren, dus dat blijft een eerlijke lege staat.
const FinanceManager = () => {
	const { ready, fallback } = useDashboardGuard('expenses.manage', { className: 'inventory', label: 'Financiën laden' });
	const [rows, setRows] = useState<FinanceRow[] | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [from, setFrom] = useState('');
	const [to, setTo] = useState('');
	const [eventId, setEventId] = useState('');
	const [category, setCategory] = useState('');

	useEffect(() => {
		if (!ready) return;
		let active = true;
		getBrowserClient()
			.rpc('finance_rollup')
			.then(({ data, error: rpcError }) => {
				if (!active) return;
				if (rpcError) {
					setError(rpcError.message);
					return;
				}
				setRows((data ?? []) as FinanceRow[]);
			});
		return () => {
			active = false;
		};
	}, [ready]);

	// Eventfilter-opties uit de rollup zelf — geen extra query. Alleen event-gebonden rijen dragen een naam.
	// Lege waarde = "alle" (selecteerbaar, zodat je een filter kunt wissen).
	const eventOptions = useMemo(() => {
		const byId = new Map<string, string>();
		for (const r of rows ?? []) if (r.event_id) byId.set(r.event_id, r.event_naam ?? r.event_id);
		const named = [...byId.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
		return [{ value: '', label: 'Alle conventies' }, ...named];
	}, [rows]);
	const categoryOptions = useMemo(() => [{ value: '', label: 'Alle categorieën' }, ...CATEGORY_OPTIONS], []);

	const filtered = useMemo(() => {
		return (rows ?? []).filter(
			(r) =>
				(from === '' || r.datum >= from) &&
				(to === '' || r.datum <= to) &&
				(eventId === '' || r.event_id === eventId) &&
				(category === '' || r.categorie === category),
		);
	}, [rows, from, to, eventId, category]);

	const totals = useMemo(() => {
		let uitgaven = 0;
		let pending = 0;
		for (const r of filtered) {
			if (isCommittedSpend(r.status)) uitgaven += Number(r.bedrag);
			else if (r.status === 'submitted') pending += Number(r.bedrag);
		}
		return { uitgaven, pending };
	}, [filtered]);

	// Balken: besteed per categorie en per conventie (losse declaraties samengevat onder één label).
	const byCategory = useMemo(() => committedBy(filtered, (r) => categoryLabel(r.categorie)), [filtered]);
	const byConference = useMemo(() => committedBy(filtered, (r) => (r.event_id ? r.event_naam ?? r.event_id : 'Losse declaraties')), [filtered]);

	const columns: DataTableColumn<FinanceRow>[] = useMemo(
		() => [
			{ key: 'bron', header: 'Bron', cell: (r) => BRON_LABELS[r.bron] ?? r.bron },
			{ key: 'event', header: 'Conventie', sortable: true, sortValue: (r) => r.event_naam ?? '', cell: (r) => (r.event_id ? r.event_naam ?? r.event_id : '—') },
			{ key: 'category', header: 'Categorie', cell: (r) => categoryLabel(r.categorie) },
			{ key: 'description', header: 'Omschrijving', cell: (r) => r.omschrijving },
			{ key: 'date', header: 'Datum', align: 'center', sortable: true, sortValue: (r) => r.datum, cell: (r) => formatDate(r.datum, { dateStyle: 'medium' }) ?? r.datum },
			{ key: 'amount', header: 'Bedrag', align: 'end', sortable: true, sortValue: (r) => Number(r.bedrag), cell: (r) => formatEur(r.bedrag) },
			{ key: 'status', header: 'Status', align: 'center', cell: (r) => <StatusBadge domain="expense" status={r.status} /> },
			{
				key: 'open',
				header: '',
				align: 'end',
				cell: (r) => (
					<Link className="finance-open-link" href={r.event_id ? `/dashboard/events?id=${r.event_id}` : '/dashboard/expenses'}>
						Openen
					</Link>
				),
			},
		],
		[],
	);

	if (!ready) return fallback;

	return (
		<Container className="inventory">
			<Title size={2}>Financiën</Title>

			{error ? (
				<Alert variant="error">Kon de financiën niet laden: {error}</Alert>
			) : rows === null ? (
				<Spinner label="Financiën laden" />
			) : (
				<div className="inventory-tab finance">
					<div className="finance-totals">
						<div className="finance-total">
							<span className="finance-total-label">Inkomsten</span>
							<span className="finance-total-empty">Nog geen inkomstenbron geregistreerd</span>
						</div>
						<div className="finance-total">
							<span className="finance-total-label">Uitgaven (besteed)</span>
							<span className="finance-total-value">{formatEur(totals.uitgaven)}</span>
							<span className="finance-total-note">waarvan {formatEur(totals.pending)} in behandeling</span>
						</div>
						<div className="finance-total">
							<span className="finance-total-label">Saldo</span>
							<span className="finance-total-empty">Niet te berekenen zonder inkomsten</span>
						</div>
					</div>

					<div className="finance-filters inventory-form">
						<Field name="from">
							<Field.Label>Van</Field.Label>
							<TextInput type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.currentTarget.value)} />
						</Field>
						<Field name="to">
							<Field.Label>Tot</Field.Label>
							<TextInput type="date" value={to} min={from || undefined} onChange={(e) => setTo(e.currentTarget.value)} />
						</Field>
						<Field name="event">
							<Field.Label>Conventie</Field.Label>
							<Select native options={eventOptions} value={eventId} onValueChange={(v) => setEventId(typeof v === 'string' ? v : '')} />
						</Field>
						<Field name="category">
							<Field.Label>Categorie</Field.Label>
							<Select native options={categoryOptions} value={category} onValueChange={(v) => setCategory(typeof v === 'string' ? v : '')} />
						</Field>
					</div>

					<DataTable columns={columns} data={filtered} empty={{ title: 'Geen posten', description: 'Geen kosten of declaraties in deze selectie.' }} />

					<div className="finance-breakdowns">
						<BarBreakdown title="Besteed per categorie" rows={byCategory} emptyLabel="Nog niets besteed in deze selectie." />
						<BarBreakdown title="Besteed per conventie" rows={byConference} emptyLabel="Nog niets besteed in deze selectie." />
					</div>
				</div>
			)}
		</Container>
	);
};

export default FinanceManager;
