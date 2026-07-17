'use client';

import { Toast } from '@base-ui/react/toast';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import type { ReportData, ReportReceipt } from '@/lib/expenses/pdf/ExpenseReport';
import { renderExpensePdf } from '@/lib/expenses/pdf/renderExpensePdf';
import { type Expense, type ExpenseStatus, formatEur, quarterOf } from '@/lib/expenses/types';
import { getBrowserClient } from '@/lib/supabase/client';

const REVIEW_OPTIONS: { value: ExpenseStatus; label: string }[] = [
	{ value: 'approved', label: 'Goedkeuren' },
	{ value: 'rejected', label: 'Afwijzen' },
	{ value: 'reimbursed', label: 'Uitbetaald' },
	{ value: 'submitted', label: 'Terug naar ingediend' },
];
const IMAGE_RE = /\.(jpe?g|png)$/i;

// Het declaratie-beheer (expenses.manage): filteren (conventie/kwartaal/persoon/status), beoordelen via de
// review_expense-RPC (je eigen declaratie kun je niet beoordelen) en een PDF-export van de selectie.
const ExpensesReview = ({ session }: { session: Session }) => {
	const toast = Toast.useToastManager();
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [people, setPeople] = useState<Map<string, string>>(new Map());
	const [events, setEvents] = useState<Map<string, string>>(new Map());
	const [refreshKey, setRefreshKey] = useState(0);
	const [fStatus, setFStatus] = useState('');
	const [fEvent, setFEvent] = useState('');
	const [fQuarter, setFQuarter] = useState('');
	const [fPerson, setFPerson] = useState('');
	const [reviewFor, setReviewFor] = useState<Expense | null>(null);
	const [reviewStatus, setReviewStatus] = useState<ExpenseStatus>('approved');
	const [reviewNote, setReviewNote] = useState('');
	const [busy, setBusy] = useState(false);
	const [exporting, setExporting] = useState(false);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('expenses').select('*').is('archived_at', null).order('incurred_on', { ascending: false }),
			db.from('profiles').select('id, username'),
			db.from('events').select('id, name'),
		]).then((res) => {
			if (!active) return;
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon declaraties niet laden', description: failed.message, type: 'error' });
				return;
			}
			const [{ data: rows }, { data: profileRows }, { data: eventRows }] = res;
			setExpenses((rows ?? []) as Expense[]);
			setPeople(new Map((profileRows ?? []).map((p) => [p.id as string, p.username as string])));
			setEvents(new Map((eventRows ?? []).map((e) => [e.id as string, e.name as string])));
		});
		return () => {
			active = false;
		};
		// toast bewust NIET in de deps: useToastManager() is niet stabiel → zou een oneindige refetch/toast-loop
		// geven bij een laadfout. `add` is intern stabiel, dus dit is veilig.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshKey]);

	const personName = (id: string): string => people.get(id) ?? id.slice(0, 8);
	const eventName = (id: string | null): string => (id ? events.get(id) ?? '—' : '—');

	const quarters = useMemo(() => [...new Set(expenses.map((e) => quarterOf(e.incurred_on)))].sort().reverse(), [expenses]);
	const personOptions = useMemo(
		() => [...new Set(expenses.map((e) => e.user_id))].map((id) => ({ value: id, label: personName(id) })).sort((a, b) => a.label.localeCompare(b.label)),
		[expenses, people],
	);
	const eventOptions = useMemo(
		() => [...new Set(expenses.map((e) => e.event_id).filter((v): v is string => v !== null))].map((id) => ({ value: id, label: eventName(id) })),
		[expenses, events],
	);

	const filtered = useMemo(
		() =>
			expenses.filter(
				(e) =>
					(fStatus === '' || e.status === fStatus) &&
					(fEvent === '' || e.event_id === fEvent) &&
					(fQuarter === '' || quarterOf(e.incurred_on) === fQuarter) &&
					(fPerson === '' || e.user_id === fPerson),
			),
		[expenses, fStatus, fEvent, fQuarter, fPerson],
	);

	const downloadReceipt = async (path: string) => {
		const { data, error } = await getBrowserClient().storage.from('receipts').createSignedUrl(path, 120);
		if (error || !data) {
			toast.add({ title: 'Kon bon niet openen', description: error?.message, type: 'error' });
			return;
		}
		window.open(data.signedUrl, '_blank', 'noopener');
	};

	const openReview = (e: Expense) => {
		setReviewFor(e);
		setReviewStatus(e.status === 'submitted' ? 'approved' : e.status);
		setReviewNote(e.review_note ?? '');
	};

	const submitReview = async () => {
		if (!reviewFor) return;
		setBusy(true);
		try {
			const { error } = await getBrowserClient().rpc('review_expense', { p_id: reviewFor.id, p_status: reviewStatus, p_note: reviewNote.trim() || null });
			if (error) {
				toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
				return;
			}
			setReviewFor(null);
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Declaratie beoordeeld', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const exportPdf = async () => {
		if (filtered.length === 0) {
			toast.add({ title: 'Geen declaraties in de selectie.', type: 'error' });
			return;
		}
		setExporting(true);
		try {
			const db = getBrowserClient();
			// Signed URLs voor image-bonnen (PDF-bonnen kunnen niet ingesloten worden in de export).
			const receipts: ReportReceipt[] = [];
			for (const e of filtered) {
				if (!IMAGE_RE.test(e.receipt_path)) continue;
				const { data } = await db.storage.from('receipts').createSignedUrl(e.receipt_path, 300);
				if (data) receipts.push({ label: `${personName(e.user_id)} — ${e.description}`, url: data.signedUrl });
			}
			const byPersonMap = new Map<string, number>();
			for (const e of filtered) byPersonMap.set(personName(e.user_id), (byPersonMap.get(personName(e.user_id)) ?? 0) + Number(e.amount_eur));
			const parts = [
				fPerson && `Persoon: ${personName(fPerson)}`,
				fEvent && `Conventie: ${eventName(fEvent)}`,
				fQuarter && `Kwartaal: ${fQuarter}`,
				fStatus && `Status: ${fStatus}`,
			].filter(Boolean);
			const data: ReportData = {
				title: 'Declaratie-overzicht',
				subtitle: parts.length ? parts.join(' · ') : 'Alle declaraties',
				generatedOn: new Date().toLocaleString('nl-NL'),
				generatedBy: session.user.email ?? session.user.id.slice(0, 8),
				rows: filtered.map((e) => ({
					description: e.description,
					person: personName(e.user_id),
					date: e.incurred_on,
					event: eventName(e.event_id),
					amount: Number(e.amount_eur),
					status: e.status,
				})),
				total: filtered.reduce((sum, e) => sum + Number(e.amount_eur), 0),
				byPerson: [...byPersonMap.entries()].map(([person, total]) => ({ person, total })).sort((a, b) => b.total - a.total),
				receipts,
			};
			const blob = await renderExpensePdf(data);
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `declaraties-${new Date().toISOString().slice(0, 10)}.pdf`;
			a.click();
			URL.revokeObjectURL(url);
		} catch (e) {
			toast.add({ title: 'PDF-export mislukt', description: e instanceof Error ? e.message : undefined, type: 'error' });
		} finally {
			setExporting(false);
		}
	};

	const columns: DataTableColumn<Expense>[] = useMemo(
		() => [
			{ key: 'person', header: 'Wie', sortable: true, sortValue: (e) => personName(e.user_id), cell: (e) => personName(e.user_id) },
			{ key: 'description', header: 'Omschrijving', sortable: true, sortValue: (e) => e.description, cell: (e) => e.description },
			{ key: 'event', header: 'Conventie', cell: (e) => eventName(e.event_id) },
			{ key: 'date', header: 'Datum', align: 'center', sortable: true, sortValue: (e) => e.incurred_on, cell: (e) => e.incurred_on },
			{ key: 'amount', header: 'Bedrag', align: 'end', sortable: true, sortValue: (e) => e.amount_eur, cell: (e) => formatEur(e.amount_eur) },
			{ key: 'status', header: 'Status', align: 'center', cell: (e) => <StatusBadge domain="expense" status={e.status} /> },
			{
				key: 'actions',
				header: '',
				align: 'end',
				cell: (e) => (
					<span className="inventory-row-actions">
						<Button variant="secondary" icon="download" onClick={() => downloadReceipt(e.receipt_path)}>
							Bon
						</Button>
						{e.user_id === session.user.id ? (
							<StatusBadge domain="request" status="cancelled" label="Eigen declaratie" />
						) : (
							<Button variant="primary" onClick={() => openReview(e)}>
								Beoordeel
							</Button>
						)}
					</span>
				),
			},
		],
		[people, events, session.user.id],
	);

	return (
		<div className="inventory-tab">
			<div className="inventory-toolbar expenses-filters">
				<Select native value={fStatus} onValueChange={(v) => setFStatus((v as string) ?? '')} aria-label="Status" options={[{ value: '', label: 'Alle statussen' }, { value: 'submitted', label: 'Ingediend' }, { value: 'approved', label: 'Goedgekeurd' }, { value: 'rejected', label: 'Afgewezen' }, { value: 'reimbursed', label: 'Uitbetaald' }]} />
				<Select native value={fPerson} onValueChange={(v) => setFPerson((v as string) ?? '')} aria-label="Persoon" options={[{ value: '', label: 'Iedereen' }, ...personOptions]} />
				<Select native value={fEvent} onValueChange={(v) => setFEvent((v as string) ?? '')} aria-label="Conventie" options={[{ value: '', label: 'Alle conventies' }, ...eventOptions]} />
				<Select native value={fQuarter} onValueChange={(v) => setFQuarter((v as string) ?? '')} aria-label="Kwartaal" options={[{ value: '', label: 'Alle kwartalen' }, ...quarters.map((q) => ({ value: q, label: q }))]} />
				<Button variant="secondary" icon="download" onClick={exportPdf} disabled={exporting}>
					{exporting ? 'Bezig…' : 'Exporteer PDF'}
				</Button>
			</div>
			<DataTable columns={columns} data={filtered} empty={{ title: 'Geen declaraties', description: 'Pas de filters aan of wacht op nieuwe declaraties.' }} />

			<Drawer
				open={reviewFor !== null}
				onOpenChange={(open) => !open && setReviewFor(null)}
				title={reviewFor ? `Beoordelen — ${reviewFor.description}` : 'Beoordelen'}
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setReviewFor(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={submitReview} disabled={busy}>
							{busy ? 'Bezig…' : 'Opslaan'}
						</Button>
					</>
				}
			>
				{reviewFor && (
					<div className="inventory-form">
						<div className="con-line-info">
							<span className="con-line-main">
								{personName(reviewFor.user_id)} · {formatEur(reviewFor.amount_eur)}
							</span>
							<span className="con-note">
								{reviewFor.incurred_on} · {eventName(reviewFor.event_id)}
							</span>
						</div>
						<Button variant="secondary" icon="download" onClick={() => downloadReceipt(reviewFor.receipt_path)}>
							Bon bekijken
						</Button>
						<Field name="rstatus">
							<Field.Label>Beslissing</Field.Label>
							<Select native value={reviewStatus} onValueChange={(v) => setReviewStatus(((v as string) ?? 'approved') as ExpenseStatus)} options={REVIEW_OPTIONS} />
						</Field>
						<Field name="rnote">
							<Field.Label>Notitie (optioneel, zichtbaar voor de declarant)</Field.Label>
							<TextArea value={reviewNote} onChange={(e) => setReviewNote(e.currentTarget.value)} />
						</Field>
					</div>
				)}
			</Drawer>
		</div>
	);
};

export default ExpensesReview;
