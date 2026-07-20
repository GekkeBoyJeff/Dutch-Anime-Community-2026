'use client';

import { Toast } from '@base-ui/react/toast';
import { useCallback, useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import Title from '@/components/basics/Title';
import Drawer from '@/components/components/Drawer';
import LineList from '@/components/dashboard/components/LineList';
import { fromInput, toInput } from '@/components/dashboard/events/datetime';
import ShiftCalendar, { type ShiftBlock, type ShiftRange } from '@/components/dashboard/structures/ShiftCalendar';
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
	// Team-only choice list (team_candidates RPC); existing non-team assignments still render via subjectName.
	candidates: SubjectName[];
	subjectName: (id: string | null) => string;
	// Event start day — opens the calendar on the convention weekend.
	eventStartsOn: string | null;
};

const EMPTY_SHIFT: ShiftForm = { subject_id: '', starts_at: '', ends_at: '', station: '', note: '' };

const toFormTime = (date: Date) => toInput(date.toISOString());

// Agenda-tab: a drag calendar over the event's shifts (create/move/resize, inventory.manage) plus the
// open swap requests (apply/cancel via the SECURITY DEFINER RPCs that enforce ownership/lock/window).
const AgendaTab = ({ eventId, sessionUserId, candidates, subjectName, eventStartsOn }: AgendaTabProps) => {
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

	const blocks = useMemo<ShiftBlock[]>(
		() =>
			shifts.map((s) => ({
				id: s.id,
				start: new Date(s.starts_at),
				end: new Date(s.ends_at),
				title: subjectName(s.subject_id),
				station: s.station,
				isLocked: s.locked_at !== null,
			})),
		[shifts, subjectName],
	);

	const defaultDate = useMemo(() => (eventStartsOn ? new Date(`${eventStartsOn}T09:00:00`) : undefined), [eventStartsOn]);

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
		setForm(null);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Shift verwijderd', type: 'success' });
	};

	// Drag-create: open the picker prefilled with the swept window; the user only adds person + station.
	const createFromDrag = useCallback((range: ShiftRange) => {
		setForm({ subject_id: '', starts_at: toFormTime(range.start), ends_at: toFormTime(range.end), station: '', note: '' });
	}, []);

	// Move/resize persist just the new window, optimistically, and roll the block back on an RLS refusal.
	const persistRange = useCallback(
		async (id: string, range: ShiftRange) => {
			const previous = shifts;
			setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, starts_at: range.start.toISOString(), ends_at: range.end.toISOString() } : s)));
			const { error } = await getBrowserClient()
				.from('event_shifts')
				.update({ starts_at: range.start.toISOString(), ends_at: range.end.toISOString() })
				.eq('id', id);
			if (error) {
				setShifts(previous);
				toast.add({ title: 'Verplaatsen mislukt', description: error.message, type: 'error' });
			}
		},
		[shifts, toast],
	);

	const openDetail = useCallback(
		(id: string) => {
			const s = shifts.find((row) => row.id === id);
			if (!s) return;
			setForm({ id: s.id, subject_id: s.subject_id ?? '', starts_at: toInput(s.starts_at), ends_at: toInput(s.ends_at), station: s.station ?? '', note: s.note ?? '' });
		},
		[shifts],
	);

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

	return (
		<div className="inventory-tab">
			<div className="inventory-toolbar">
				<Title size={5}>Shifts</Title>
				<Button variant="primary" icon="plus" onClick={() => setForm({ ...EMPTY_SHIFT })}>
					Nieuwe shift
				</Button>
			</div>

			<ShiftCalendar
				shifts={blocks}
				editable
				defaultDate={defaultDate}
				onCreate={createFromDrag}
				onMove={persistRange}
				onResize={persistRange}
				onSelect={openDetail}
			/>

			{swaps.length > 0 && (
				<div className="con-group">
					<Title element="h3" size={6} value="Openstaande ruilverzoeken" />
					<LineList
						items={swaps.map((sw) => ({
							main: (
								<>
									{subjectName(sw.from_subject)} → {subjectName(sw.to_subject)}
								</>
							),
							meta: (
								<>
									<Button variant="primary" onClick={() => applySwap(sw.id)}>
										Toepassen
									</Button>
									<Button variant="ghost" onClick={() => cancelSwap(sw.id)}>
										Annuleren
									</Button>
								</>
							),
						}))}
					/>
				</div>
			)}

			<Drawer
				open={form !== null}
				onOpenChange={(o) => !o && setForm(null)}
				title={form?.id ? 'Shift bewerken' : 'Nieuwe shift'}
				size="30rem"
				footer={
					<>
						{form?.id && (
							<Button variant="ghost" icon="trash" onClick={() => deleteShift(form.id as string)}>
								Verwijder
							</Button>
						)}
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
								options={[{ value: '', label: 'Niemand' }, ...candidates.map((s) => ({ value: s.id, label: s.display_name }))]}
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
