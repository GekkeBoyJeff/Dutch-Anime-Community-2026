'use client';

import { Toast } from '@base-ui/react/toast';
import type { Session } from '@supabase/supabase-js';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { type Expense, formatEur } from '@/lib/expenses/types';
import { prepareReceipt } from '@/lib/receipts/prepareReceipt';
import { getBrowserClient } from '@/lib/supabase/client';
import { genUuid } from '@/lib/uuid';

interface EventOpt {
	id: string;
	name: string;
}
interface ExpenseForm {
	id?: string;
	description: string;
	amount: string;
	incurred_on: string;
	event_id: string;
	file: File | null;
}

const EMPTY: ExpenseForm = { description: '', amount: '', incurred_on: '', event_id: '', file: null };

// De persoonlijke declaratie-view (expenses.view): eigen declaraties indienen (met verplicht bonnetje),
// bewerken zolang ze 'ingediend' zijn, intrekken, de bon downloaden en de reden van een afwijzing zien.
const MyExpenses = ({ session }: { session: Session }) => {
	const toast = Toast.useToastManager();
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [events, setEvents] = useState<EventOpt[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [form, setForm] = useState<ExpenseForm | null>(null);
	const [busy, setBusy] = useState(false);
	const [toWithdraw, setToWithdraw] = useState<Expense | null>(null);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		// Expliciet op de eigen gebruiker scopen: een manager-RLS zou anders álle declaraties teruggeven.
		Promise.all([
			db.from('expenses').select('*').eq('user_id', session.user.id).is('archived_at', null).order('incurred_on', { ascending: false }),
			db.from('events').select('id, name').order('starts_on', { ascending: false, nullsFirst: false }),
		]).then((res) => {
			if (!active) return;
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon je declaraties niet laden', description: failed.message, type: 'error' });
				return;
			}
			const [{ data: rows }, { data: eventRows }] = res;
			setExpenses((rows ?? []) as Expense[]);
			setEvents((eventRows ?? []) as EventOpt[]);
		});
		return () => {
			active = false;
		};
		// toast bewust NIET in de deps: useToastManager() is niet stabiel (nieuwe identity bij elke toast),
		// dus dat zou bij een laadfout een oneindige refetch/toast-loop veroorzaken. `add` is intern stabiel.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [session, refreshKey]);

	const eventName = (id: string | null): string => (id ? events.find((e) => e.id === id)?.name ?? '—' : '—');

	const save = async () => {
		if (!form) return;
		const amount = Number(form.amount.replace(',', '.'));
		if (!form.description.trim() || !form.incurred_on || !(amount > 0)) {
			toast.add({ title: 'Vul omschrijving, bedrag (> 0) en datum in.', type: 'error' });
			return;
		}
		const db = getBrowserClient();
		setBusy(true);
		try {
			if (form.id) {
				// Bewerken kan alleen zolang de declaratie 'ingediend' is (RLS dwingt dat af). .select() zodat een
				// 0-rijen no-op (bv. intussen beoordeeld → USING matcht niet, géén error) niet als succes leest.
				const { data, error } = await db
					.from('expenses')
					.update({ description: form.description.trim(), amount_eur: amount, incurred_on: form.incurred_on, event_id: form.event_id || null })
					.eq('id', form.id)
					.select();
				if (error) {
					toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
					return;
				}
				if (!data || data.length === 0) {
					toast.add({ title: 'Bewerken niet gelukt', description: 'Deze declaratie is waarschijnlijk al beoordeeld en kan niet meer bewerkt worden.', type: 'error' });
					setForm(null);
					setRefreshKey((k) => k + 1);
					return;
				}
				toast.add({ title: 'Declaratie bijgewerkt', type: 'success' });
			} else {
				if (!form.file) {
					toast.add({ title: 'Een bonnetje is verplicht.', type: 'error' });
					return;
				}
				// Genereer het id vooraf zodat het bonpad <user_id>/<expense_id>/… al bestaat vóór de insert.
				const id = genUuid();
				let prepared: File;
				try {
					prepared = await prepareReceipt(form.file);
				} catch (e) {
					toast.add({ title: 'Bon niet verwerkt', description: e instanceof Error ? e.message : undefined, type: 'error' });
					return;
				}
				const path = `${session.user.id}/${id}/${prepared.name}`;
				const up = await db.storage.from('receipts').upload(path, prepared, { contentType: prepared.type, upsert: false });
				if (up.error) {
					toast.add({ title: 'Kon bon niet uploaden', description: up.error.message, type: 'error' });
					return;
				}
				const { error } = await db.from('expenses').insert({
					id,
					user_id: session.user.id,
					event_id: form.event_id || null,
					description: form.description.trim(),
					amount_eur: amount,
					incurred_on: form.incurred_on,
					status: 'submitted',
					receipt_path: path,
				});
				if (error) {
					await db.storage.from('receipts').remove([path]); // ruim de wees-bon op als de rij niet lukt.
					toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
					return;
				}
				toast.add({ title: 'Declaratie ingediend', type: 'success' });
			}
			setForm(null);
			setRefreshKey((k) => k + 1);
		} catch (e) {
			toast.add({ title: 'Er ging iets mis', description: e instanceof Error ? e.message : undefined, type: 'error' });
		} finally {
			setBusy(false);
		}
	};

	const downloadReceipt = async (path: string) => {
		const { data, error } = await getBrowserClient().storage.from('receipts').createSignedUrl(path, 120);
		if (error || !data) {
			toast.add({ title: 'Kon bon niet openen', description: error?.message, type: 'error' });
			return;
		}
		window.open(data.signedUrl, '_blank', 'noopener');
	};

	const withdraw = async (expense: Expense) => {
		// .select() zodat een RLS-no-op (bv. intussen beoordeeld) niet als succes wordt gemeld.
		const { data, error } = await getBrowserClient()
			.from('expenses')
			.update({ archived_at: new Date().toISOString(), archived_by: session.user.id })
			.eq('id', expense.id)
			.select();
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		if (!data || data.length === 0) {
			toast.add({ title: 'Intrekken niet gelukt', description: 'Deze declaratie is waarschijnlijk al beoordeeld.', type: 'error' });
			return;
		}
		toast.add({ title: 'Declaratie ingetrokken', type: 'success' });
	};

	const columns: DataTableColumn<Expense>[] = useMemo(
		() => [
			{
				key: 'description',
				header: 'Omschrijving',
				sortable: true,
				sortValue: (e) => e.description,
				cell: (e) => (
					<div className="con-line-info">
						<span className="con-line-main">{e.description}</span>
						{e.status === 'rejected' && e.review_note && <span className="con-note">Afgewezen: {e.review_note}</span>}
					</div>
				),
			},
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
						{e.status === 'submitted' && (
							<>
								<Button
									variant="secondary"
									onClick={() =>
										setForm({ id: e.id, description: e.description, amount: String(e.amount_eur), incurred_on: e.incurred_on, event_id: e.event_id ?? '', file: null })
									}
								>
									Bewerk
								</Button>
								<Button variant="ghost" onClick={() => setToWithdraw(e)}>
									Intrekken
								</Button>
							</>
						)}
					</span>
				),
			},
		],
		// eventName leest uit `events`; herbereken als dat verandert zodat de kolom stabiel blijft voor DataTable.
		[events],
	);

	return (
		<div className="inventory-tab">
			<div className="inventory-toolbar">
				<Title element="h3" size={4}>Mijn declaraties</Title>
				<Button variant="primary" icon="plus" onClick={() => setForm({ ...EMPTY })}>
					Nieuwe declaratie
				</Button>
			</div>
			<DataTable columns={columns} data={expenses} empty={{ title: 'Nog geen declaraties', description: 'Dien je eerste declaratie in met een bonnetje.' }} />

			<Drawer
				open={form !== null}
				onOpenChange={(open) => !open && setForm(null)}
				title={form?.id ? 'Declaratie bewerken' : 'Nieuwe declaratie'}
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={save} disabled={busy}>
							{busy ? 'Bezig…' : form?.id ? 'Opslaan' : 'Indienen'}
						</Button>
					</>
				}
			>
				{form && (
					<div className="inventory-form">
						<Field name="description">
							<Field.Label>Omschrijving</Field.Label>
							<TextInput value={form.description} onChange={(e) => setForm({ ...form, description: e.currentTarget.value })} />
						</Field>
						<Field name="amount">
							<Field.Label>Bedrag (€)</Field.Label>
							<TextInput type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.currentTarget.value })} />
						</Field>
						<Field name="incurred_on">
							<Field.Label>Datum</Field.Label>
							<TextInput type="date" value={form.incurred_on} onChange={(e) => setForm({ ...form, incurred_on: e.currentTarget.value })} />
						</Field>
						<Field name="event">
							<Field.Label>Conventie (optioneel)</Field.Label>
							<Select
								native
								value={form.event_id}
								onValueChange={(v) => setForm({ ...form, event_id: (v as string) ?? '' })}
								options={[{ value: '', label: '— Geen —' }, ...events.map((e) => ({ value: e.id, label: e.name }))]}
							/>
						</Field>
						{!form.id && (
							<Field name="receipt">
								<Field.Label>Bonnetje (JPG/PNG/HEIC of PDF)</Field.Label>
								<TextInput
									type="file"
									accept="image/*,application/pdf,.heic,.heif"
									onChange={(e) => setForm({ ...form, file: e.currentTarget.files?.[0] ?? null })}
								/>
							</Field>
						)}
					</div>
				)}
			</Drawer>

			<ConfirmDialog
				open={toWithdraw !== null}
				onOpenChange={(open) => !open && setToWithdraw(null)}
				title="Declaratie intrekken?"
				description={toWithdraw ? `"${toWithdraw.description}" wordt uit je lijst gehaald.` : undefined}
				confirmLabel="Intrekken"
				destructive
				onConfirm={() => {
					if (toWithdraw) withdraw(toWithdraw);
					setToWithdraw(null);
				}}
			/>
		</div>
	);
};

export default MyExpenses;
