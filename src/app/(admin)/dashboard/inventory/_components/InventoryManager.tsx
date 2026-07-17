'use client';

import { Toast } from '@base-ui/react/toast';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import PersonPicker, { type PersonOption, type PersonValue } from '@/app/(admin)/dashboard/_components/PersonPicker';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import DetailTabs from '@/components/components/DetailTabs';
import Drawer from '@/components/components/Drawer';
import FilterBar from '@/components/components/FilterBar';
import Checkbox from '@/components/forms/Checkbox';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { getBrowserClient } from '@/lib/supabase/client';

interface Item {
	id: string;
	name: string;
	owner_user_id: string | null;
	owner_label: string | null;
	quantity: number;
	value_eur: number | null;
	available: boolean;
	notes: string | null;
	archived_at: string | null;
}
interface EventRow {
	id: string;
	name: string;
	location: string | null;
	starts_on: string | null;
	ends_on: string | null;
	notes: string | null;
	archived_at: string | null;
}
interface ItemForm {
	id?: string;
	name: string;
	owner: PersonValue;
	quantity: string;
	value_eur: string;
	available: boolean;
	notes: string;
}
interface EventForm {
	id?: string;
	name: string;
	location: string;
	starts_on: string;
	ends_on: string;
	notes: string;
}

const EMPTY_ITEM: ItemForm = { name: '', owner: { userId: null, label: null }, quantity: '1', value_eur: '', available: true, notes: '' };
const EMPTY_EVENT: EventForm = { name: '', location: '', starts_on: '', ends_on: '', notes: '' };

// A convention is "verlopen" once its last day (ends_on, else starts_on) is before today; undated
// conventions stay "aankomend". Dates are ISO YYYY-MM-DD, so a string compare is a date compare.
const isPast = (event: EventRow, today: string): boolean => {
	const end = event.ends_on ?? event.starts_on;
	return end ? end < today : false;
};

// Resolve an item's owner to a display name: a linked user's username, else the free-text label.
const ownerName = (item: Item, users: PersonOption[]): string =>
	item.owner_user_id ? users.find((u) => u.id === item.owner_user_id)?.username ?? item.owner_user_id.slice(0, 8) : item.owner_label ?? '—';

const InventoryManager = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard('inventory.manage', { className: 'inventory', label: 'Inventory laden' });

	const [users, setUsers] = useState<PersonOption[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [events, setEvents] = useState<EventRow[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [itemForm, setItemForm] = useState<ItemForm | null>(null);
	const [eventForm, setEventForm] = useState<EventForm | null>(null);
	const toast = Toast.useToastManager();
	const router = useRouter();
	const [itemToDelete, setItemToDelete] = useState<Item | null>(null);
	const [eventToDelete, setEventToDelete] = useState<EventRow | null>(null);
	const [itemSearch, setItemSearch] = useState('');
	const [itemFilter, setItemFilter] = useState('');
	const [eventSearch, setEventSearch] = useState('');
	const [eventFilter, setEventFilter] = useState('');
	const [showArchivedItems, setShowArchivedItems] = useState(false);
	const [showArchivedEvents, setShowArchivedEvents] = useState(false);

	const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('profiles').select('id, username').order('username'),
			db.from('inventory_items').select('*').order('name'),
			db.from('events').select('*').order('starts_on', { ascending: false, nullsFirst: false }),
		]).then(([{ data: profiles }, { data: itemRows }, { data: eventRows }]) => {
			if (!active) return;
			setUsers((profiles ?? []) as PersonOption[]);
			setItems((itemRows ?? []) as Item[]);
			setEvents((eventRows ?? []) as EventRow[]);
		});
		return () => {
			active = false;
		};
	}, [ready, session, refreshKey]);

	const saveItem = async () => {
		if (!itemForm || !session) return;
		const payload = {
			...(itemForm.id ? { id: itemForm.id } : {}),
			name: itemForm.name.trim(),
			owner_user_id: itemForm.owner.userId,
			owner_label: itemForm.owner.userId ? null : itemForm.owner.label,
			quantity: Number(itemForm.quantity) || 1,
			value_eur: itemForm.value_eur ? Number(itemForm.value_eur) : null,
			available: itemForm.available,
			notes: itemForm.notes.trim() || null,
			created_by: session.user.id,
		};
		if (!payload.name) {
			toast.add({ title: 'Naam is verplicht.', type: 'error' });
			return;
		}
		const { error: err } = await getBrowserClient().from('inventory_items').upsert(payload);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setItemForm(null);
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Item opgeslagen', type: 'success' });
	};

	// Archiveren (omkeerbaar) is de normale "weg"-actie voor iedereen met manage; hard delete is admin-only.
	const archiveItem = async (id: string, archived: boolean) => {
		const { error: err } = await getBrowserClient()
			.from('inventory_items')
			.update({ archived_at: archived ? new Date().toISOString() : null, archived_by: archived ? session?.user.id ?? null : null })
			.eq('id', id);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: archived ? 'Item gearchiveerd' : 'Item hersteld', type: 'success' });
	};

	// Hard delete via de records.delete-gated RPC: die geeft de storage-paden terug die verweesd raken,
	// waarna de client ze via de Storage-API opruimt (Postgres kan het S3-object niet zelf wissen).
	const hardDeleteItem = async (id: string) => {
		const db = getBrowserClient();
		const { data, error: err } = await db.rpc('hard_delete', { target_table: 'inventory_items', target_id: id });
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		for (const row of (data ?? []) as { bucket_id: string; path: string }[]) {
			if (row.path) await db.storage.from(row.bucket_id).remove([row.path]);
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Item definitief verwijderd', type: 'success' });
	};

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

	const filteredItems = useMemo(() => {
		const q = itemSearch.trim().toLowerCase();
		return items.filter((item) => {
			const matchesSearch = q === '' || item.name.toLowerCase().includes(q) || ownerName(item, users).toLowerCase().includes(q);
			const matchesFilter = itemFilter === '' || (itemFilter === 'available' ? item.available : !item.available);
			const matchesArchived = showArchivedItems || item.archived_at === null;
			return matchesSearch && matchesFilter && matchesArchived;
		});
	}, [items, users, itemSearch, itemFilter, showArchivedItems]);

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

	if (!ready || !session) return fallback;

	const canHardDelete = permissions.has('records.delete');

	const itemColumns: DataTableColumn<Item>[] = [
		{ key: 'name', header: 'Naam', sortable: true, sortValue: (item) => item.name, cell: (item) => item.name },
		{ key: 'owner', header: 'Eigenaar', sortable: true, sortValue: (item) => ownerName(item, users), cell: (item) => ownerName(item, users) },
		{ key: 'quantity', header: 'Aantal', align: 'center', sortable: true, sortValue: (item) => item.quantity, cell: (item) => String(item.quantity) },
		{
			key: 'value',
			header: 'Waarde',
			align: 'end',
			sortable: true,
			sortValue: (item) => item.value_eur ?? 0,
			cell: (item) => (item.value_eur !== null ? `€ ${item.value_eur.toFixed(2)}` : '—'),
		},
		{
			key: 'available',
			header: 'Beschikbaar',
			align: 'center',
			sortable: true,
			sortValue: (item) => (item.available ? 1 : 0),
			cell: (item) => (
				<StatusBadge domain="request" status={item.available ? 'active' : 'cancelled'} label={item.available ? 'Beschikbaar' : 'Niet beschikbaar'} />
			),
		},
		{
			key: 'actions',
			header: '',
			align: 'end',
			cell: (item) => (
				<span className="inventory-row-actions">
					{item.archived_at ? (
						<Button variant="secondary" onClick={() => archiveItem(item.id, false)}>
							Herstellen
						</Button>
					) : (
						<>
							<Button
								variant="secondary"
								onClick={() =>
									setItemForm({
										id: item.id,
										name: item.name,
										owner: { userId: item.owner_user_id, label: item.owner_label },
										quantity: String(item.quantity),
										value_eur: item.value_eur?.toString() ?? '',
										available: item.available,
										notes: item.notes ?? '',
									})
								}
							>
								Bewerk
							</Button>
							<Button variant="ghost" onClick={() => archiveItem(item.id, true)}>
								Archiveren
							</Button>
						</>
					)}
					{canHardDelete && (
						<Button variant="ghost" icon="trash" onClick={() => setItemToDelete(item)}>
							Verwijder
						</Button>
					)}
				</span>
			),
		},
	];

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

	const itemsPanel = (
		<div className="inventory-tab">
			<div className="inventory-toolbar">
				<FilterBar
					filters={[
						{ label: 'Alle', value: '' },
						{ label: 'Beschikbaar', value: 'available' },
						{ label: 'Niet beschikbaar', value: 'unavailable' },
					]}
					value={itemFilter}
					onValueChange={setItemFilter}
					label="Filter items"
					searchable
					searchValue={itemSearch}
					onSearchValueChange={setItemSearch}
					searchPlaceholder="Zoek op naam of eigenaar…"
					searchLabel="Zoek item"
				/>
				<Button variant="primary" icon="plus" onClick={() => setItemForm({ ...EMPTY_ITEM })}>
					Nieuw item
				</Button>
					<Checkbox checked={showArchivedItems} onCheckedChange={(v) => setShowArchivedItems(v)} label="Toon gearchiveerd" />
			</div>
			<DataTable
				columns={itemColumns}
				data={filteredItems}
				empty={{
					title: 'Geen items gevonden',
					description: itemSearch || itemFilter ? 'Pas je zoekopdracht of filter aan.' : 'Voeg je eerste item toe.',
				}}
			/>
		</div>
	);

	const eventsPanel = (
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
	);

	return (
		<Container className="inventory">
			<Title size={2}>Inventory &amp; conventies</Title>

			<DetailTabs
				label="Inventory"
				tabs={[
					{ label: 'Items', panel: itemsPanel },
					{ label: 'Conventies', panel: eventsPanel },
				]}
			/>

			<Drawer
				open={itemForm !== null}
				onOpenChange={(open) => !open && setItemForm(null)}
				title={itemForm?.id ? 'Item bewerken' : 'Nieuw item'}
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setItemForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={saveItem}>
							Opslaan
						</Button>
					</>
				}
			>
				{itemForm && (
					<div className="inventory-form">
						<Field name="name">
							<Field.Label>Naam</Field.Label>
							<TextInput value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.currentTarget.value })} />
						</Field>
						<PersonPicker labelText="Eigenaar" users={users} value={itemForm.owner} onChange={(owner) => setItemForm({ ...itemForm, owner })} />
						<Field name="quantity">
							<Field.Label>Aantal</Field.Label>
							<TextInput type="number" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.currentTarget.value })} />
						</Field>
						<Field name="value">
							<Field.Label>Waarde (€)</Field.Label>
							<TextInput type="number" value={itemForm.value_eur} onChange={(e) => setItemForm({ ...itemForm, value_eur: e.currentTarget.value })} />
						</Field>
						<Checkbox checked={itemForm.available} onCheckedChange={(available) => setItemForm({ ...itemForm, available })} label="Beschikbaar" />
						<Field name="notes">
							<Field.Label>Notities</Field.Label>
							<TextArea value={itemForm.notes} onChange={(e) => setItemForm({ ...itemForm, notes: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>

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
				open={itemToDelete !== null}
				onOpenChange={(open) => !open && setItemToDelete(null)}
				title="Item definitief verwijderen?"
				description={itemToDelete ? `"${itemToDelete.name}" en gekoppelde bestanden worden onherstelbaar verwijderd.` : undefined}
				confirmLabel="Definitief verwijderen"
				destructive
				onConfirm={() => {
					if (itemToDelete) hardDeleteItem(itemToDelete.id);
					setItemToDelete(null);
				}}
			/>

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

export default InventoryManager;
