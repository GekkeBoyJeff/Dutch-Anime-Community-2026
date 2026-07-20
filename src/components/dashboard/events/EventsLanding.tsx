'use client';

import { Toast } from '@base-ui/react/toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import Drawer from '@/components/components/Drawer';
import EmptyState from '@/components/components/EmptyState';
import FilterBar from '@/components/components/FilterBar';
import { rememberRowCount, recallRowCount } from '@/components/dashboard/components/DataTableSkeleton';
import EventAdminCard from '@/components/dashboard/components/EventAdminCard';
import SegmentedControl from '@/components/dashboard/components/SegmentedControl';
import StatTile from '@/components/dashboard/components/StatTile';
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

// Landing page for the "Conventies & events" section: a stat row, upcoming conventions as prominent
// cards over a compacter past grid, and the entry point into the 7-tab editor (/dashboard/events?id=…).
const EventsLanding = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard('inventory.manage', { className: 'inventory', label: 'Conventies laden' });

	const router = useRouter();
	const searchParams = useSearchParams();
	const [events, setEvents] = useState<EventRow[] | null>(null);
	const [refreshKey, setRefreshKey] = useState(0);
	// Deep-link from the ⌘K palette (/dashboard/events?new=1): open the create drawer straight away.
	const [eventForm, setEventForm] = useState<EventForm | null>(() => (searchParams.get('new') === '1' ? { ...EMPTY_EVENT } : null));
	const toast = Toast.useToastManager();
	const [eventToDelete, setEventToDelete] = useState<EventRow | null>(null);
	const [eventSearch, setEventSearch] = useState('');
	const [eventFilter, setEventFilter] = useState('');
	const [showArchivedEvents, setShowArchivedEvents] = useState(false);
	// Skeleton card count for the first paint, recalled from the last visit (capped for the card grid).
	const [skeletonCount] = useState(() => Math.min(recallRowCount('events', 3), 6));

	const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

	// Strip ?new=1 after the drawer opened above, so a refresh doesn't reopen it.
	useEffect(() => {
		if (searchParams.get('new') === '1') router.replace('/dashboard/events');
	}, [searchParams, router]);

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
				const rows = (data ?? []) as EventRow[];
				setEvents(rows);
				rememberRowCount('events', rows.length);
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
		return (events ?? []).filter((event) => {
			const matchesSearch = q === '' || event.name.toLowerCase().includes(q) || (event.location ?? '').toLowerCase().includes(q);
			const past = isPast(event, today);
			const matchesFilter = eventFilter === '' || (eventFilter === 'upcoming' ? !past : past);
			const matchesArchived = showArchivedEvents || event.archived_at === null;
			return matchesSearch && matchesFilter && matchesArchived;
		});
	}, [events, eventSearch, eventFilter, today, showArchivedEvents]);

	// The two card zones: upcoming first (prominent), past below (compacter). Sorted chronologically.
	const upcomingCards = useMemo(
		() => filteredEvents.filter((event) => !isPast(event, today)).sort((a, b) => (a.starts_on ?? '') < (b.starts_on ?? '') ? -1 : 1),
		[filteredEvents, today],
	);
	const pastCards = useMemo(
		() => filteredEvents.filter((event) => isPast(event, today)).sort((a, b) => (a.starts_on ?? '') > (b.starts_on ?? '') ? -1 : 1),
		[filteredEvents, today],
	);

	// Stats derive from the already-fetched events, not from the search/filter above them.
	const activeEvents = useMemo(() => (events ?? []).filter((event) => event.archived_at === null), [events]);
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

	const loading = events === null;
	const canHardDelete = permissions.has('records.delete');

	// One convention as a card, via the promoted EventAdminCard tier. "Beheer" is the primary action
	// (into the 7-tab editor); the archived/active branch and hard-delete visibility ride on the callbacks.
	const renderEventCard = (event: EventRow, compact = false) => (
		<EventAdminCard
			key={event.id}
			name={event.name}
			location={event.location}
			startsOn={event.starts_on}
			endsOn={event.ends_on}
			status={isPast(event, today) ? 'past' : 'upcoming'}
			archived={event.archived_at !== null}
			compact={compact}
			onManage={() => router.push(`/dashboard/events?id=${event.id}`)}
			onEdit={() =>
				setEventForm({
					id: event.id,
					name: event.name,
					location: event.location ?? '',
					starts_on: event.starts_on ?? '',
					ends_on: event.ends_on ?? '',
					notes: event.notes ?? '',
				})
			}
			onArchive={() => archiveEvent(event.id, true)}
			onRestore={() => archiveEvent(event.id, false)}
			onDelete={canHardDelete ? () => setEventToDelete(event) : undefined}
		/>
	);

	return (
		<Container className="inventory events-page">
			<div className="events-header">
				<Title size={2}>Conventies &amp; events</Title>
				<Button variant="primary" icon="plus" onClick={() => setEventForm({ ...EMPTY_EVENT })}>
					Nieuwe conventie
				</Button>
			</div>

			<div className="events">
			<div className="stat-tile-row">
				<StatTile label="Aankomend" value={upcomingEvents.length} loading={loading} />
				<StatTile
					label="Eerstvolgende datum"
					value={nextEvent?.starts_on ? formatDate(nextEvent.starts_on, { dateStyle: 'medium' }) ?? nextEvent.starts_on : '—'}
					loading={loading}
				/>
				<StatTile label="Events dit jaar" value={thisYearCount} loading={loading} />
			</div>

			<div className="events-toolbar">
				<SegmentedControl
					aria-label="Filter conventies"
					value={eventFilter}
					onValueChange={setEventFilter}
					options={[
						{ value: '', label: 'Alle' },
						{ value: 'upcoming', label: 'Aankomend' },
						{ value: 'past', label: 'Verlopen' },
					]}
				/>
				<FilterBar
					filters={[]}
					value={eventFilter}
					searchable
					searchValue={eventSearch}
					onSearchValueChange={setEventSearch}
					searchPlaceholder="Zoek op naam of locatie…"
					searchLabel="Zoek conventie"
				>
					<Checkbox checked={showArchivedEvents} onCheckedChange={(v) => setShowArchivedEvents(v)} label="Toon gearchiveerd" />
				</FilterBar>
			</div>

			{loading ? (
				<div className="events-card-grid" aria-hidden="true">
					{Array.from({ length: skeletonCount }, (_, i) => (
						<EventAdminCard key={i} loading name="" startsOn={null} status="upcoming" onManage={() => {}} />
					))}
				</div>
			) : filteredEvents.length === 0 ? (
				<EmptyState
					icon="calendar"
					title={eventSearch || eventFilter ? 'Niets gevonden' : 'Nog geen conventies'}
					description={
						eventSearch || eventFilter
							? 'Pas je zoekopdracht of filter aan — misschien staat het onder een andere periode.'
							: 'Zodra je de eerste conventie toevoegt, verschijnt hier het overzicht. Begin bovenaan met “Nieuwe conventie”.'
					}
				/>
			) : (
				<div className="reveal events-zones">
					{upcomingCards.length > 0 && (
						<section className="events-zone">
							<Title element="h2" size={5}>Aankomend</Title>
							<div className="events-card-grid">{upcomingCards.map((event) => renderEventCard(event))}</div>
						</section>
					)}
					{pastCards.length > 0 && (
						<section className="events-zone">
							<Title element="h2" size={5}>Verlopen</Title>
							<div className="events-card-grid is-compact">{pastCards.map((event) => renderEventCard(event, true))}</div>
						</section>
					)}
				</div>
			)}
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
