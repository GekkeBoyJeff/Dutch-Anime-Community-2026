'use client';

import { Toast } from '@base-ui/react/toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import type { PersonOption } from '@/app/(admin)/dashboard/_components/PersonPicker';
import ActivitiesTab from '@/app/(admin)/dashboard/events/_components/ActivitiesTab';
import AgendaTab from '@/app/(admin)/dashboard/events/_components/AgendaTab';
import CostsTab from '@/app/(admin)/dashboard/events/_components/CostsTab';
import EvaluationTab from '@/app/(admin)/dashboard/events/_components/EvaluationTab';
import PostTab from '@/app/(admin)/dashboard/events/_components/PostTab';
import EventDetail from '@/app/(admin)/dashboard/inventory/_components/EventDetail';
import Alert from '@/components/basics/Alert';
import Breadcrumb from '@/components/basics/Breadcrumb';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import DetailTabs from '@/components/components/DetailTabs';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Enums } from '@/types/database.types';

interface EventRow {
	id: string;
	name: string;
	location: string | null;
	kind: string;
	starts_on: string | null;
	ends_on: string | null;
	signups_open_at: string | null;
	signups_close_at: string | null;
	notes: string | null;
	budget_eur: number | null;
}
interface SubjectName {
	id: string;
	display_name: string;
}
interface Attendance {
	id: string;
	subject_id: string;
	status: string;
	note: string | null;
}
interface ItemOption {
	id: string;
	name: string;
}
interface EventForm {
	name: string;
	location: string;
	kind: string;
	starts_on: string;
	ends_on: string;
	signups_open_at: string;
	signups_close_at: string;
	notes: string;
}

const ATTENDANCE_OPTIONS = [
	{ value: 'signed_up', label: 'Ingeschreven' },
	{ value: 'expected', label: 'Verwacht' },
	{ value: 'present', label: 'Aanwezig' },
	{ value: 'late', label: 'Te laat' },
	{ value: 'cancelled_late', label: 'Laat afgezegd' },
	{ value: 'no_show', label: 'Niet op komen dagen' },
];

// timestamptz <-> <input type="datetime-local"> (lokale wandkloktijd, consistent heen en terug).
const toInput = (iso: string | null): string => {
	if (!iso) return '';
	const d = new Date(iso);
	const p = (n: number) => String(n).padStart(2, '0');
	return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const fromInput = (s: string): string | null => (s ? new Date(s).toISOString() : null);

// Getabde conventie-/event-detail. Query-param-route (?id=) i.p.v. [id] omdat de productie een statische
// export is. Alles client-side via RLS. Items & tickets hergebruiken de bestaande EventDetail.
const EventEditor = () => {
	const { ready, fallback, session } = useDashboardGuard('inventory.manage', { className: 'inventory', label: 'Conventie laden' });
	const router = useRouter();
	// EventsRouter only mounts this component when ?id= is present.
	const eventId = useSearchParams().get('id') as string;
	const toast = Toast.useToastManager();

	const [event, setEvent] = useState<EventRow | null>(null);
	const [users, setUsers] = useState<PersonOption[]>([]);
	const [items, setItems] = useState<ItemOption[]>([]);
	const [subjects, setSubjects] = useState<SubjectName[]>([]);
	const [candidates, setCandidates] = useState<SubjectName[]>([]);
	const [attendance, setAttendance] = useState<Attendance[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [loaded, setLoaded] = useState(false);
	const [form, setForm] = useState<EventForm | null>(null);
	const [addSubject, setAddSubject] = useState('');

	useEffect(() => {
		if (!ready || !session || !eventId) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('events').select('*').eq('id', eventId).maybeSingle(),
			db.from('profiles').select('id, username').order('username'),
			db.from('inventory_items').select('id, name').order('name'),
			db.from('subject_names').select('id, display_name'),
			db.from('event_attendance').select('id, subject_id, status, note').eq('event_id', eventId),
			db.rpc('team_candidates'),
		]).then(([{ data: ev }, { data: profiles }, { data: itemRows }, { data: subjectRows }, { data: att }, { data: candidateRows }]) => {
			if (!active) return;
			setEvent((ev ?? null) as EventRow | null);
			setUsers((profiles ?? []) as PersonOption[]);
			setItems((itemRows ?? []) as ItemOption[]);
			setSubjects((subjectRows ?? []) as SubjectName[]);
			setAttendance((att ?? []) as Attendance[]);
			setCandidates((candidateRows ?? []).map((c) => ({ id: c.subject_id, display_name: c.display_name })));
			setLoaded(true);
		});
		return () => {
			active = false;
		};
	}, [ready, session, eventId, refreshKey]);

	const subjectName = (id: string | null): string => (id ? subjects.find((s) => s.id === id)?.display_name ?? id.slice(0, 8) : '—');

	const attendanceRows = useMemo(() => [...attendance], [attendance]);
	const availableSubjects = useMemo(
		() => subjects.filter((s) => !attendance.some((a) => a.subject_id === s.id)),
		[subjects, attendance],
	);

	const saveInfo = async () => {
		if (!form || !event) return;
		if (!form.name.trim()) {
			toast.add({ title: 'Naam is verplicht.', type: 'error' });
			return;
		}
		const { error: err } = await getBrowserClient()
			.from('events')
			.update({
				name: form.name.trim(),
				location: form.location.trim() || null,
				kind: form.kind as Enums<'event_kind'>,
				starts_on: form.starts_on || null,
				ends_on: form.ends_on || null,
				signups_open_at: fromInput(form.signups_open_at),
				signups_close_at: fromInput(form.signups_close_at),
				notes: form.notes.trim() || null,
			})
			.eq('id', event.id);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setForm(null);
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Opgeslagen', type: 'success' });
	};

	const setStatus = async (id: string, status: string) => {
		const { error: err } = await getBrowserClient().from('event_attendance').update({ status: status as Enums<'attendance_status'> }).eq('id', id);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Status bijgewerkt', type: 'success' });
	};

	const addAttendee = async () => {
		if (!addSubject || !session || !eventId) return;
		const { error: err } = await getBrowserClient()
			.from('event_attendance')
			.insert({ event_id: eventId, subject_id: addSubject, status: 'expected', created_by: session.user.id });
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setAddSubject('');
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Deelnemer toegevoegd', type: 'success' });
	};

	const removeAttendee = async (id: string) => {
		const { error: err } = await getBrowserClient().from('event_attendance').delete().eq('id', id);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Deelnemer verwijderd', type: 'success' });
	};

	if (!ready || !session) return fallback;

	const crumbs = [
		{ label: 'Dashboard', url: '/dashboard' },
		{ label: 'Conventies & events', url: '/dashboard/events' },
		{ label: event ? event.name : 'Conventie' },
	];

	if (!loaded) {
		return (
			<Container className="inventory">
				<Breadcrumb items={crumbs} />
				<Spinner label="Conventie laden" />
			</Container>
		);
	}

	const attendanceColumns: DataTableColumn<Attendance>[] = [
		{ key: 'subject', header: 'Persoon', sortable: true, sortValue: (r) => subjectName(r.subject_id), cell: (r) => subjectName(r.subject_id) },
		{
			key: 'status',
			header: 'Status',
			cell: (r) => <StatusBadge domain="attendance" status={r.status} />,
		},
		{
			key: 'change',
			header: 'Wijzig',
			cell: (r) => (
				<Select
					native
					aria-label={`Status voor ${subjectName(r.subject_id)}`}
					value={r.status}
					options={ATTENDANCE_OPTIONS}
					onValueChange={(v) => setStatus(r.id, v as string)}
				/>
			),
		},
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (r) => (
				<Button variant="ghost" icon="trash" onClick={() => removeAttendee(r.id)}>
					Verwijder
				</Button>
			),
		},
	];

	const infoPanel = event && (
		<div className="inventory-form">
			<Field name="name">
				<Field.Label>Naam</Field.Label>
				<TextInput value={form?.name ?? event.name} onChange={(e) => setForm({ ...toForm(event, form), name: e.currentTarget.value })} />
			</Field>
			<Field name="location">
				<Field.Label>Locatie</Field.Label>
				<TextInput value={form?.location ?? event.location ?? ''} onChange={(e) => setForm({ ...toForm(event, form), location: e.currentTarget.value })} />
			</Field>
			<Field name="kind">
				<Field.Label>Soort</Field.Label>
				<Select
					native
					aria-label="Soort"
					value={form?.kind ?? event.kind}
					options={[
						{ value: 'convention', label: 'Conventie' },
						{ value: 'event', label: 'Evenement' },
					]}
					onValueChange={(v) => setForm({ ...toForm(event, form), kind: v as string })}
				/>
			</Field>
			<Field name="starts_on">
				<Field.Label>Startdatum</Field.Label>
				<TextInput type="date" value={form?.starts_on ?? event.starts_on ?? ''} onChange={(e) => setForm({ ...toForm(event, form), starts_on: e.currentTarget.value })} />
			</Field>
			<Field name="ends_on">
				<Field.Label>Einddatum</Field.Label>
				<TextInput type="date" value={form?.ends_on ?? event.ends_on ?? ''} onChange={(e) => setForm({ ...toForm(event, form), ends_on: e.currentTarget.value })} />
			</Field>
			<Field name="signups_open_at">
				<Field.Label>Inschrijven open vanaf</Field.Label>
				<TextInput type="datetime-local" value={form ? form.signups_open_at : toInput(event.signups_open_at)} onChange={(e) => setForm({ ...toForm(event, form), signups_open_at: e.currentTarget.value })} />
			</Field>
			<Field name="signups_close_at">
				<Field.Label>Inschrijven sluit</Field.Label>
				<TextInput type="datetime-local" value={form ? form.signups_close_at : toInput(event.signups_close_at)} onChange={(e) => setForm({ ...toForm(event, form), signups_close_at: e.currentTarget.value })} />
			</Field>
			<Field name="notes">
				<Field.Label>Notities</Field.Label>
				<TextArea value={form?.notes ?? event.notes ?? ''} onChange={(e) => setForm({ ...toForm(event, form), notes: e.currentTarget.value })} />
			</Field>
			<div className="inventory-row-actions">
				<Button variant="primary" onClick={saveInfo} disabled={form === null}>
					Opslaan
				</Button>
				<Button variant="secondary" onClick={() => router.push('/dashboard/events')}>
					Terug naar Conventies &amp; events
				</Button>
			</div>
		</div>
	);

	const attendancePanel = (
		<div className="inventory-tab">
			<div className="inventory-toolbar">
				<Select
					native
					aria-label="Deelnemer toevoegen"
					className="access-role-select"
					value={addSubject}
					options={[{ value: '', label: 'Kies persoon…' }, ...availableSubjects.map((s) => ({ value: s.id, label: s.display_name }))]}
					onValueChange={(v) => setAddSubject(v as string)}
				/>
				<Button variant="primary" icon="plus" onClick={addAttendee} disabled={!addSubject}>
					Deelnemer toevoegen
				</Button>
			</div>
			<DataTable
				columns={attendanceColumns}
				data={attendanceRows}
				empty={{ title: 'Nog geen aanwezigheid', description: 'Voeg deelnemers toe of wacht op inschrijvingen.' }}
			/>
		</div>
	);

	return (
		<Container className="inventory">
			<Breadcrumb items={crumbs} />
			<Title size={2}>{event ? event.name : 'Conventie'}</Title>
			{event === null ? (
				<>
					<Alert variant="error" title="Niet gevonden">Deze conventie bestaat niet of je hebt er geen toegang toe.</Alert>
					<Button variant="secondary" onClick={() => router.push('/dashboard/events')}>
						Terug naar Conventies &amp; events
					</Button>
				</>
			) : (
				<DetailTabs
					label="Conventie"
					tabs={[
						{ label: 'Info', panel: infoPanel },
						{ label: 'Aanwezigheid', panel: attendancePanel },
						{ label: 'Agenda', panel: <AgendaTab eventId={eventId} sessionUserId={session.user.id} candidates={candidates} subjectName={subjectName} /> },
						{
							label: 'Activiteiten',
							panel: <ActivitiesTab eventId={eventId} sessionUserId={session.user.id} items={items} candidates={candidates} subjectName={subjectName} />,
						},
						{
							label: 'Kosten',
							panel: <CostsTab eventId={eventId} initialBudget={event.budget_eur} onBudgetSaved={(b) => setEvent((ev) => (ev ? { ...ev, budget_eur: b } : ev))} />,
						},
						{ label: 'Evaluatie', panel: <EvaluationTab eventId={eventId} /> },
						{
							label: 'Items & tickets',
							panel: (
								<EventDetail
									event={event}
									items={items}
									users={users}
									onClose={() => router.push('/dashboard/events')}
									onError={(message) => toast.add({ title: 'Er ging iets mis', description: message, type: 'error' })}
								/>
							),
						},
						{
							label: 'Post',
							panel: (
								<PostTab
									eventId={eventId}
									sessionUserId={session.user.id}
									eventName={event.name}
									startsOn={event.starts_on}
									attendance={attendance}
									users={users}
									subjectName={subjectName}
								/>
							),
						},
					]}
				/>
			)}
		</Container>
	);
};

// De Info-velden bewerken een lokale form-kopie; init 'm uit het event zodra de eerste wijziging komt.
const toForm = (event: EventRow, form: EventForm | null): EventForm =>
	form ?? {
		name: event.name,
		location: event.location ?? '',
		kind: event.kind,
		starts_on: event.starts_on ?? '',
		ends_on: event.ends_on ?? '',
		signups_open_at: toInput(event.signups_open_at),
		signups_close_at: toInput(event.signups_close_at),
		notes: event.notes ?? '',
	};

export default EventEditor;
