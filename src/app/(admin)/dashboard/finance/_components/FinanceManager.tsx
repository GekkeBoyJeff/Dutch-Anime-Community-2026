'use client';

import { Toast } from '@base-ui/react/toast';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import BarBreakdown from '@/app/(admin)/dashboard/finance/_components/BarBreakdown';
import Alert from '@/components/basics/Alert';
import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { usePermissions } from '@/lib/auth/permissions';
import { categoryLabel, formatEur, isCommittedSpend } from '@/lib/expenses/types';
import { formatDate } from '@/lib/formatDate';
import { INCOME_CATEGORY_OPTIONS, incomeCategoryLabel, type IncomeCategory } from '@/lib/income/types';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Database } from '@/types/database.types';

type FinanceRow = Database['public']['Functions']['finance_rollup']['Returns'][number];
interface EventOpt {
	id: string;
	name: string;
}
interface IncomeForm {
	id?: string;
	description: string;
	amount: string;
	received_on: string;
	event_id: string;
	category: IncomeCategory;
}

const EMPTY_INCOME: IncomeForm = { description: '', amount: '', received_on: '', event_id: '', category: 'other' };
const BRON_LABELS: Record<string, string> = { kosten: 'Kosten (conventie)', declaratie: 'Declaratie (los)' };

// Categorie-label per richting: inkomsten en uitgaven hebben eigen enums (income_category vs expense_category).
const rowCategoryLabel = (r: FinanceRow): string => (r.richting === 'inkomsten' ? incomeCategoryLabel(r.categorie) : categoryLabel(r.categorie));

// Besteed (goedgekeurd + uitbetaald) opgeteld per groepssleutel, aflopend gesorteerd — voedt de balken.
// Inkomsten tellen hier niet mee: dit is uitsluitend uitgaven-besteding.
const committedBy = (source: FinanceRow[], key: (r: FinanceRow) => string): { label: string; amount: number }[] => {
	const map = new Map<string, number>();
	for (const r of source) {
		if (r.richting === 'inkomsten' || !isCommittedSpend(r.status)) continue;
		map.set(key(r), (map.get(key(r)) ?? 0) + Number(r.bedrag));
	}
	return [...map.entries()].map(([label, amount]) => ({ label, amount })).sort((a, b) => b.amount - a.amount);
};

// Org-brede Financiën (expenses.manage): één rollup over al het geld dat DAC uitgeeft én binnenkrijgt. Haalt
// de vlakke finance_rollup-dataset op (RLS/RPC is de grens; de guard is UX) en filtert + aggregeert
// client-side. Inkomsten worden hier beheerd (toevoegen/bewerken; verwijderen alleen met records.delete).
const FinanceManager = () => {
	const { ready, fallback } = useDashboardGuard('expenses.manage', { className: 'inventory', label: 'Financiën laden' });
	const toast = Toast.useToastManager();
	const { permissions } = usePermissions();
	const canHardDelete = permissions.has('records.delete');
	const [rows, setRows] = useState<FinanceRow[] | null>(null);
	const [events, setEvents] = useState<EventOpt[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	const [from, setFrom] = useState('');
	const [to, setTo] = useState('');
	const [eventId, setEventId] = useState('');
	const [category, setCategory] = useState('');
	const [form, setForm] = useState<IncomeForm | null>(null);
	const [busy, setBusy] = useState(false);
	const [toDelete, setToDelete] = useState<FinanceRow | null>(null);

	useEffect(() => {
		if (!ready) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([db.rpc('finance_rollup'), db.from('events').select('id, name').order('starts_on', { ascending: false, nullsFirst: false })]).then(([rollup, eventRes]) => {
			if (!active) return;
			if (rollup.error) {
				setError(rollup.error.message);
				return;
			}
			setRows((rollup.data ?? []) as FinanceRow[]);
			setEvents((eventRes.data ?? []) as EventOpt[]);
		});
		return () => {
			active = false;
		};
	}, [ready, refreshKey]);

	// Eventfilter-opties uit de rollup zelf — geen extra query. Alleen event-gebonden rijen dragen een naam.
	const eventOptions = useMemo(() => {
		const byId = new Map<string, string>();
		for (const r of rows ?? []) if (r.event_id) byId.set(r.event_id, r.event_naam ?? r.event_id);
		const named = [...byId.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
		return [{ value: '', label: 'Alle conventies' }, ...named];
	}, [rows]);
	// Categorie-opties uit de aanwezige rijen zodat zowel inkomsten- als uitgaven-categorieën verschijnen.
	const categoryOptions = useMemo(() => {
		const byVal = new Map<string, string>();
		for (const r of rows ?? []) byVal.set(r.categorie, rowCategoryLabel(r));
		const named = [...byVal.entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label));
		return [{ value: '', label: 'Alle categorieën' }, ...named];
	}, [rows]);

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
		let inkomsten = 0;
		for (const r of filtered) {
			if (r.richting === 'inkomsten') inkomsten += Number(r.bedrag);
			else if (isCommittedSpend(r.status)) uitgaven += Number(r.bedrag);
			else if (r.status === 'submitted') pending += Number(r.bedrag);
		}
		return { uitgaven, pending, inkomsten, saldo: inkomsten - uitgaven };
	}, [filtered]);

	// Balken: besteed per categorie en per conventie (losse declaraties samengevat onder één label).
	const byCategory = useMemo(() => committedBy(filtered, (r) => categoryLabel(r.categorie)), [filtered]);
	const byConference = useMemo(() => committedBy(filtered, (r) => (r.event_id ? r.event_naam ?? r.event_id : 'Losse declaraties')), [filtered]);

	const saveIncome = async () => {
		if (!form) return;
		const amount = Number(form.amount.replace(',', '.'));
		if (!form.description.trim() || !form.received_on || !(amount > 0)) {
			toast.add({ title: 'Vul omschrijving, bedrag (> 0) en datum in.', type: 'error' });
			return;
		}
		const db = getBrowserClient();
		setBusy(true);
		try {
			const payload = {
				description: form.description.trim(),
				amount_eur: amount,
				received_on: form.received_on,
				event_id: form.event_id || null,
				category: form.category,
			};
			// .select() zodat een RLS-no-op (0 rijen, geen error) niet als succes leest.
			const { data, error: mutErr } = form.id
				? await db.from('org_income').update(payload).eq('id', form.id).select()
				: await db.from('org_income').insert(payload).select();
			if (mutErr) {
				toast.add({ title: 'Er ging iets mis', description: mutErr.message, type: 'error' });
				return;
			}
			if (!data || data.length === 0) {
				toast.add({ title: 'Opslaan niet gelukt', description: 'Je hebt hier mogelijk geen rechten voor.', type: 'error' });
				return;
			}
			toast.add({ title: form.id ? 'Inkomst bijgewerkt' : 'Inkomst toegevoegd', type: 'success' });
			setForm(null);
			setRefreshKey((k) => k + 1);
		} finally {
			setBusy(false);
		}
	};

	// Hard delete via de records.delete-gated RPC (spiegelt inventory/expenses). Inkomsten hebben geen
	// storage-objecten, dus er komen geen paden terug om op te ruimen.
	const deleteIncome = async (id: string) => {
		const { error: rpcErr } = await getBrowserClient().rpc('hard_delete', { target_table: 'org_income', target_id: id });
		if (rpcErr) {
			toast.add({ title: 'Er ging iets mis', description: rpcErr.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Inkomst verwijderd', type: 'success' });
	};

	const columns: DataTableColumn<FinanceRow>[] = useMemo(
		() => [
			{ key: 'bron', header: 'Bron', cell: (r) => (r.richting === 'inkomsten' ? <Badge variant="success">Inkomst</Badge> : BRON_LABELS[r.bron] ?? r.bron) },
			{ key: 'event', header: 'Conventie', sortable: true, sortValue: (r) => r.event_naam ?? '', cell: (r) => (r.event_id ? r.event_naam ?? r.event_id : '—') },
			{ key: 'category', header: 'Categorie', cell: (r) => rowCategoryLabel(r) },
			{ key: 'description', header: 'Omschrijving', cell: (r) => r.omschrijving },
			{ key: 'date', header: 'Datum', align: 'center', sortable: true, sortValue: (r) => r.datum, cell: (r) => formatDate(r.datum, { dateStyle: 'medium' }) ?? r.datum },
			{ key: 'amount', header: 'Bedrag', align: 'end', sortable: true, sortValue: (r) => Number(r.bedrag), cell: (r) => formatEur(r.bedrag) },
			{ key: 'status', header: 'Status', align: 'center', cell: (r) => (r.richting === 'inkomsten' ? <Badge variant="info">Ontvangen</Badge> : <StatusBadge domain="expense" status={r.status} />) },
			{
				key: 'open',
				header: '',
				align: 'end',
				cell: (r) =>
					r.richting === 'inkomsten' ? (
						<span className="inventory-row-actions">
							<Button variant="secondary" onClick={() => setForm({ id: r.id, description: r.omschrijving, amount: String(r.bedrag), received_on: r.datum, event_id: r.event_id ?? '', category: r.categorie as IncomeCategory })}>
								Bewerk
							</Button>
							{canHardDelete && (
								<Button variant="ghost" onClick={() => setToDelete(r)}>
									Verwijder
								</Button>
							)}
						</span>
					) : (
						<Link className="finance-open-link" href={r.event_id ? `/dashboard/events?id=${r.event_id}` : '/dashboard/expenses'}>
							Openen
						</Link>
					),
			},
		],
		[canHardDelete],
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
					<div className="inventory-toolbar">
						<span className="finance-total-label">Overzicht van alle inkomsten en uitgaven</span>
						<Button variant="primary" icon="plus" onClick={() => setForm({ ...EMPTY_INCOME })}>
							Inkomst toevoegen
						</Button>
					</div>

					<div className="finance-totals">
						<div className="finance-total">
							<span className="finance-total-label">Inkomsten</span>
							<span className="finance-total-value">{formatEur(totals.inkomsten)}</span>
						</div>
						<div className="finance-total">
							<span className="finance-total-label">Uitgaven (besteed)</span>
							<span className="finance-total-value">{formatEur(totals.uitgaven)}</span>
							<span className="finance-total-note">waarvan {formatEur(totals.pending)} in behandeling</span>
						</div>
						<div className="finance-total">
							<span className="finance-total-label">Saldo</span>
							<span className="finance-total-value">{formatEur(totals.saldo)}</span>
							<span className="finance-total-note">inkomsten − besteed</span>
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

					<DataTable columns={columns} data={filtered} empty={{ title: 'Geen posten', description: 'Geen inkomsten, kosten of declaraties in deze selectie.' }} />

					<div className="finance-breakdowns">
						<BarBreakdown title="Besteed per categorie" rows={byCategory} emptyLabel="Nog niets besteed in deze selectie." />
						<BarBreakdown title="Besteed per conventie" rows={byConference} emptyLabel="Nog niets besteed in deze selectie." />
					</div>
				</div>
			)}

			<Drawer
				open={form !== null}
				onOpenChange={(open) => !open && setForm(null)}
				title={form?.id ? 'Inkomst bewerken' : 'Inkomst toevoegen'}
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={saveIncome} disabled={busy}>
							{busy ? 'Bezig…' : form?.id ? 'Opslaan' : 'Toevoegen'}
						</Button>
					</>
				}
			>
				{form && (
					<div className="inventory-form">
						<Field name="description">
							<Field.Label>Omschrijving</Field.Label>
							<TextArea value={form.description} onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
						</Field>
						<Field name="amount">
							<Field.Label>Bedrag (€)</Field.Label>
							<TextInput type="number" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.currentTarget.value })} />
						</Field>
						<Field name="received_on">
							<Field.Label>Datum</Field.Label>
							<TextInput type="date" value={form.received_on} onChange={(e) => setForm({ ...form, received_on: e.currentTarget.value })} />
						</Field>
						<Field name="category">
							<Field.Label>Categorie</Field.Label>
							<Select native value={form.category} onValueChange={(v) => setForm({ ...form, category: ((v as string) ?? 'other') as IncomeCategory })} options={INCOME_CATEGORY_OPTIONS} />
						</Field>
						<Field name="event">
							<Field.Label>Conventie (optioneel)</Field.Label>
							<Select native value={form.event_id} onValueChange={(v) => setForm({ ...form, event_id: (v as string) ?? '' })} options={[{ value: '', label: '— Geen —' }, ...events.map((e) => ({ value: e.id, label: e.name }))]} />
						</Field>
					</div>
				)}
			</Drawer>

			<ConfirmDialog
				open={toDelete !== null}
				onOpenChange={(open) => !open && setToDelete(null)}
				title="Inkomst verwijderen?"
				description={toDelete ? `"${toDelete.omschrijving}" wordt definitief verwijderd.` : undefined}
				confirmLabel="Verwijderen"
				destructive
				onConfirm={() => {
					if (toDelete) deleteIncome(toDelete.id);
					setToDelete(null);
				}}
			/>
		</Container>
	);
};

export default FinanceManager;
