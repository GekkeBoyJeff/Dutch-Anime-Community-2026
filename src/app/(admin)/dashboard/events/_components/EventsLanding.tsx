'use client';

import { Toast } from '@base-ui/react/toast';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import FilterBar from '@/components/components/FilterBar';
import Checkbox from '@/components/forms/Checkbox';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

interface EventRow {
	id: string;
	name: string;
	location: string | null;
	starts_on: string | null;
	ends_on: string | null;
	notes: string | null;
	archived_at: string | null;
}
interface EventForm {
	id?: string;
	name: string;
	location: string;
	starts_on: string;
	ends_on: string;
	notes: string;
}

const EMPTY_EVENT: EventForm = { name: '', location: '', starts_on: '', ends_on: '', notes: '' };

// A convention is "verlopen" once its last day (ends_on, else starts_on) is before today; undated
// conventions stay "aankomend". Dates are ISO YYYY-MM-DD, so a string compare is a date compare.
const isPast = (event: EventRow, today: string): boolean => {
	const end = event.ends_on ?? event.starts_on;
	return end ? end < today : false;
};

// Landing page for the "Conventies & events" section: upcoming/past conventions, a compact stats
// row, and the entry point into the 7-tab editor (/dashboard/events?id=…).
const EventsLanding = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard('inventory.manage', { className: 'inventory', label: 'Conventies laden' });

	const [events, setEvents] = useState<EventRow[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [eventForm, setEventForm] = useState<EventForm | null>(null);
	const toast = Toast.useToastManager();
	const router = useRouter();
	const [eventToDelete, setEventToDelete] = useState<EventRow | null>(null);
	const [eventSearch, setEventSearch] = useState('');
	const [eventFilter, setEventFilter] = useState('');
	const [showArchivedEvents, setShowArchivedEvents] = useState(false);

	const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		db.from('events')
			.select('*')
			.order('starts_on', { ascending: false, nullsFirst: false })
			.then(({ data, error: err }) => {
				if (!active) return;
				if (err) {
					toast.add({ title: 'Kon conventies niet laden', description: err.message, type: 'error' });
					return;
				}
				setEvents((data ?? []) as EventRow[]);
			});
		return () => {
			active = false;
		};
	}, [ready, session, refreshKey]);

	const saveEvent = async () => {
		if (!eventForm || !session) return;
		const payload = {
			...(eventForm.id ? { id: eventForm.id } : {}),
			name: eventForm.name.trim(),
			location: eventForm.location.trim() || null,
			starts_on: eventForm.starts_on || null,
			ends_on: eventForm.ends_on || null,
			notes: eventForm.notes.trim() || null,
			created_by: session.user.id,
		};
		if (!payload.name) {
			toast.add({ title: 'Naam is verplicht.', type: 'error' });
			return;
		}
		const { error: err } = await getBrowserClient().from('events').upsert(payload);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setEventForm(null);
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Conventie opgeslagen', type: 'success' });
	};

	const archiveEvent = async (id: string, archived: boolean) => {
		const { error: err } = await getBrowserClient()
			.from('events')
			.update({ archived_at: archived ? new Date().toISOString() : null, archived_by: archived ? session?.user.id ?? null : null })
			.eq('id', id);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: archived ? 'Conventie gearchiveerd' : 'Conventie hersteld', type: 'success' });
	};

	const hardDeleteEvent = async (id: string) => {
		const db = getBrowserClient();
		const { data, error: err } = await db.rpc('hard_delete', { target_table: 'events', target_id: id });
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		for (const row of (data ?? []) as { bucket_id: string; path: string }[]) {
			if (row.path) await db.storage.from(row.bucket_id).remove([row.path]);
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Conventie definitief verwijderd', type: 'success' });
	};

	const filteredEvents = useMemo(() => {
		const q = eventSearch.trim().toLowerCase();
		return events.filter((event) => {
			const matchesSearch = q === '' || event.name.toLowerCase().includes(q) || (event.location ?? '').toLowerCase().includes(q);
			const past = isPast(event, today);
			const matchesFilter = eventFilter === '' || (eventFilter === 'upcoming' ? !past : past);
			const matchesArchived = showArchivedEvents || event.archived_at === null;
			return matchesSearch && matchesFilter && matchesArchived;
		});
	}, [events, eventSearch, eventFilter, today, showArchivedEvents]);

	// Stats derive from the already-fetched events, not from the search/filter above them.
	const activeEvents = useMemo(() => events.filter((event) => event.archived_at === null), [events]);
	const upcomingEvents = useMemo(() => activeEvents.filter((event) => !isPast(event, today)), [activeEvents, today]);
	const nextEvent = useMemo(
		() => upcomingEvents.filter((event) => event.starts_on !== null).sort((a, b) => (a.starts_on! < b.starts_on! ? -1 : 1))[0],
		[upcomingEvents],
	);
	const thisYearCount = useMemo(
		() => activeEvents.filter((event) => event.starts_on?.slice(0, 4) === String(new Date().getFullYear())).length,
		[activeEvents],
	);

	if (!ready || !session) return fallback;

	const canHardDelete = permissions.has('records.delete');

	const eventColumns: DataTableColumn<EventRow>[] = [
		{ key: 'name', header: 'Naam', sortable: true, sortValue: (event) => event.name, cell: (event) => event.name },
		{ key: 'location', header: 'Locatie', cell: (event) => event.location ?? '—' },
		{
			key: 'date',
			header: 'Datum',
			sortable: true,
			sortValue: (event) => event.starts_on ?? '',
			cell: (event) => [event.starts_on, event.ends_on].filter(Boolean).join(' – ') || '—',
		},
		{
			key: 'status',
			header: 'Status',
			align: 'center',
			cell: (event) => {
				const past = isPast(event, today);
				return <StatusBadge domain="request" status={past ? 'cancelled' : 'active'} label={past ? 'Verlopen' : 'Aankomend'} />;
			},
		},
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (event) => (
				<span className="inventory-row-actions">
					<Button variant="primary" onClick={() => router.push(`/dashboard/events?id=${event.id}`)}>
						Beheer
					</Button>
					{event.archived_at ? (
						<Button variant="secondary" onClick={() => archiveEvent(event.id, false)}>
							Herstellen
						</Button>
					) : (
						<>
							<Button
								variant="secondary"
								onClick={() =>
									setEventForm({
										id: event.id,
										name: event.name,
										location: event.location ?? '',
										starts_on: event.starts_on ?? '',
										ends_on: event.ends_on ?? '',
										notes: event.notes ?? '',
									})
								}
							>
								Bewerk
							</Button>
							<Button variant="ghost" onClick={() => archiveEvent(event.id, true)}>
								Archiveren
							</Button>
						</>
					)}
					{canHardDelete && (
						<Button variant="ghost" icon="trash" onClick={() => setEventToDelete(event)}>
							Verwijder
						</Button>
					)}
				</span>
			),
		},
	];

	return (
		<Container className="inventory">
			<Title size={2}>Conventies &amp; events</Title>

			<div className="events-stats">
				<div className="events-stat">
					<span className="events-stat-label">Aankomend</span>
					<span className="events-stat-value">{upcomingEvents.length}</span>
				</div>
				<div className="events-stat">
					<span className="events-stat-label">Eerstvolgende datum</span>
					<span className="events-stat-value">{nextEvent?.starts_on ? formatDate(nextEvent.starts_on, { dateStyle: 'medium' }) ?? nextEvent.starts_on : '—'}</span>
				</div>
				<div className="events-stat">
					<span className="events-stat-label">Events dit jaar</span>
					<span className="events-stat-value">{thisYearCount}</span>
				</div>
			</div>

			<div className="inventory-tab">
				<div className="inventory-toolbar">
					<FilterBar
						filters={[
							{ label: 'Alle', value: '' },
							{ label: 'Aankomend', value: 'upcoming' },
							{ label: 'Verlopen', value: 'past' },
						]}
						value={eventFilter}
						onValueChange={setEventFilter}
						label="Filter conventies"
						searchable
						searchValue={eventSearch}
						onSearchValueChange={setEventSearch}
						searchPlaceholder="Zoek op naam of locatie…"
						searchLabel="Zoek conventie"
					/>
					<Button variant="primary" icon="plus" onClick={() => setEventForm({ ...EMPTY_EVENT })}>
						Nieuwe conventie
					</Button>
					<Checkbox checked={showArchivedEvents} onCheckedChange={(v) => setShowArchivedEvents(v)} label="Toon gearchiveerd" />
				</div>
				<DataTable
					columns={eventColumns}
					data={filteredEvents}
					empty={{
						title: 'Geen conventies gevonden',
						description: eventSearch || eventFilter ? 'Pas je zoekopdracht of filter aan.' : 'Voeg je eerste conventie toe.',
					}}
				/>
			</div>

			<Drawer
				open={eventForm !== null}
				onOpenChange={(open) => !open && setEventForm(null)}
				title={eventForm?.id ? 'Conventie bewerken' : 'Nieuwe conventie'}
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setEventForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={saveEvent}>
							Opslaan
						</Button>
					</>
				}
			>
				{eventForm && (
					<div className="inventory-form">
						<Field name="name">
							<Field.Label>Naam</Field.Label>
							<TextInput value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.currentTarget.value })} />
						</Field>
						<Field name="location">
							<Field.Label>Locatie</Field.Label>
							<TextInput value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.currentTarget.value })} />
						</Field>
						<Field name="starts">
							<Field.Label>Startdatum</Field.Label>
							<TextInput type="date" value={eventForm.starts_on} onChange={(e) => setEventForm({ ...eventForm, starts_on: e.currentTarget.value })} />
						</Field>
						<Field name="ends">
							<Field.Label>Einddatum</Field.Label>
							<TextInput type="date" value={eventForm.ends_on} onChange={(e) => setEventForm({ ...eventForm, ends_on: e.currentTarget.value })} />
						</Field>
						<Field name="notes">
							<Field.Label>Notities</Field.Label>
							<TextArea value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>

			<ConfirmDialog
				open={eventToDelete !== null}
				onOpenChange={(open) => !open && setEventToDelete(null)}
				title="Conventie definitief verwijderen?"
				description={eventToDelete ? `"${eventToDelete.name}" en gekoppelde tickets/bestanden worden onherstelbaar verwijderd.` : undefined}
				confirmLabel="Definitief verwijderen"
				destructive
				onConfirm={() => {
					if (eventToDelete) hardDeleteEvent(eventToDelete.id);
					setEventToDelete(null);
				}}
			/>
		</Container>
	);
};

export default EventsLanding;
