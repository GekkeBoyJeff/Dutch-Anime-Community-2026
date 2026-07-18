'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import { fmtRange, fromInput, toInput } from '@/app/(admin)/dashboard/events/_components/datetime';
import Button from '@/components/basics/Button';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { getBrowserClient } from '@/lib/supabase/client';

type SubjectName = { id: string; display_name: string };
type Shift = { id: string; subject_id: string | null; starts_at: string; ends_at: string; station: string | null; note: string | null; locked_at: string | null };
type Swap = { id: string; shift_id: string; from_subject: string; to_subject: string; status: string };
type ShiftForm = { id?: string; subject_id: string; starts_at: string; ends_at: string; station: string; note: string };

type AgendaTabProps = {
	eventId: string;
	sessionUserId: string;
	subjects: SubjectName[];
	subjectName: (id: string | null) => string;
};

const EMPTY_SHIFT: ShiftForm = { subject_id: '', starts_at: '', ends_at: '', station: '', note: '' };

// Agenda-tab: shifts (CRUD, inventory.manage) + openstaande ruilverzoeken (toepassen/annuleren via de
// SECURITY DEFINER-RPC's die de ownership/lock/venster-regels afdwingen).
const AgendaTab = ({ eventId, sessionUserId, subjects, subjectName }: AgendaTabProps) => {
	const toast = Toast.useToastManager();
	const [shifts, setShifts] = useState<Shift[]>([]);
	const [swaps, setSwaps] = useState<Swap[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [form, setForm] = useState<ShiftForm | null>(null);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		db.from('event_shifts')
			.select('*')
			.eq('event_id', eventId)
			.order('starts_at')
			.then(async ({ data: shiftRows }) => {
				if (!active) return;
				const list = (shiftRows ?? []) as Shift[];
				setShifts(list);
				const ids = list.map((s) => s.id);
				if (ids.length) {
					const { data: swapRows } = await db
						.from('shift_swap_requests')
						.select('id, shift_id, from_subject, to_subject, status')
						.in('shift_id', ids)
						.eq('status', 'pending');
					if (active) setSwaps((swapRows ?? []) as Swap[]);
				} else if (active) {
					setSwaps([]);
				}
			});
		return () => {
			active = false;
		};
	}, [eventId, refreshKey]);

	const shiftRows = useMemo(() => [...shifts], [shifts]);

	const saveShift = async () => {
		if (!form) return;
		const startsAt = fromInput(form.starts_at);
		const endsAt = fromInput(form.ends_at);
		if (!startsAt || !endsAt) {
			toast.add({ title: 'Start- en eindtijd zijn verplicht.', type: 'error' });
			return;
		}
		const payload = {
			...(form.id ? { id: form.id } : {}),
			event_id: eventId,
			subject_id: form.subject_id || null,
			starts_at: startsAt,
			ends_at: endsAt,
			station: form.station.trim() || null,
			note: form.note.trim() || null,
			created_by: sessionUserId,
		};
		const { error } = await getBrowserClient().from('event_shifts').upsert(payload);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setForm(null);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Shift opgeslagen', type: 'success' });
	};

	const deleteShift = async (id: string) => {
		const { error } = await getBrowserClient().from('event_shifts').delete().eq('id', id);
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Shift verwijderd', type: 'success' });
	};

	const applySwap = async (id: string) => {
		const { error } = await getBrowserClient().rpc('apply_shift_swap', { request_id: id });
		if (error) {
			toast.add({ title: 'Ruil niet toegepast', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Ruil toegepast', type: 'success' });
	};

	const cancelSwap = async (id: string) => {
		const { error } = await getBrowserClient().rpc('cancel_swap', { request_id: id });
		if (error) {
			toast.add({ title: 'Niet geannuleerd', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Ruilverzoek geannuleerd', type: 'success' });
	};

	const columns: DataTableColumn<Shift>[] = [
		{ key: 'person', header: 'Persoon', cell: (s) => subjectName(s.subject_id) },
		{ key: 'time', header: 'Tijd', sortable: true, sortValue: (s) => s.starts_at, cell: (s) => fmtRange(s.starts_at, s.ends_at) },
		{ key: 'station', header: 'Station', cell: (s) => s.station ?? '—' },
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (s) => (
				<span className="inventory-row-actions">
					<Button
						variant="secondary"
						onClick={() => setForm({ id: s.id, subject_id: s.subject_id ?? '', starts_at: toInput(s.starts_at), ends_at: toInput(s.ends_at), station: s.station ?? '', note: s.note ?? '' })}
					>
						Bewerk
					</Button>
					<Button variant="ghost" icon="trash" onClick={() => deleteShift(s.id)}>
						Verwijder
					</Button>
				</span>
			),
		},
	];

	return (
		<div className="inventory-tab">
			<div className="inventory-toolbar">
				<Title size={5}>Shifts</Title>
				<Button variant="primary" icon="plus" onClick={() => setForm({ ...EMPTY_SHIFT })}>
					Nieuwe shift
				</Button>
			</div>
			<DataTable columns={columns} data={shiftRows} empty={{ title: 'Nog geen shifts', description: 'Voeg shifts toe voor dit event.' }} />

			{swaps.length > 0 && (
				<div className="con-group">
					<Title element="h3" size={6} value="Openstaande ruilverzoeken" />
					<ul className="con-list">
						{swaps.map((sw) => (
							<li key={sw.id} className="con-line">
								<span className="con-line-main">
									{subjectName(sw.from_subject)} → {subjectName(sw.to_subject)}
								</span>
								<span className="inventory-row-actions">
									<Button variant="primary" onClick={() => applySwap(sw.id)}>
										Toepassen
									</Button>
									<Button variant="ghost" onClick={() => cancelSwap(sw.id)}>
										Annuleren
									</Button>
								</span>
							</li>
						))}
					</ul>
				</div>
			)}

			<Drawer
				open={form !== null}
				onOpenChange={(o) => !o && setForm(null)}
				title={form?.id ? 'Shift bewerken' : 'Nieuwe shift'}
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={saveShift}>
							Opslaan
						</Button>
					</>
				}
			>
				{form && (
					<div className="inventory-form">
						<Field name="subject">
							<Field.Label>Persoon</Field.Label>
							<Select
								native
								aria-label="Persoon"
								value={form.subject_id}
								options={[{ value: '', label: 'Niemand' }, ...subjects.map((s) => ({ value: s.id, label: s.display_name }))]}
								onValueChange={(v) => setForm({ ...form, subject_id: v as string })}
							/>
						</Field>
						<Field name="starts">
							<Field.Label>Start</Field.Label>
							<TextInput type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.currentTarget.value })} />
						</Field>
						<Field name="ends">
							<Field.Label>Eind</Field.Label>
							<TextInput type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.currentTarget.value })} />
						</Field>
						<Field name="station">
							<Field.Label>Station</Field.Label>
							<TextInput value={form.station} onChange={(e) => setForm({ ...form, station: e.currentTarget.value })} />
						</Field>
						<Field name="note">
							<Field.Label>Notitie</Field.Label>
							<TextArea value={form.note} onChange={(e) => setForm({ ...form, note: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>
		</div>
	);
};

export default AgendaTab;
