'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import PersonPicker, { type PersonOption, type PersonValue } from '@/app/dashboard/_components/PersonPicker';
import EventDetail from '@/app/dashboard/inventory/_components/EventDetail';
import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import Title from '@/components/basics/Title';
import Modal from '@/components/components/Modal';
import Table from '@/components/components/Table';
import Checkbox from '@/components/forms/Checkbox';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { usePermissions } from '@/lib/auth/permissions';
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
}
interface EventRow {
	id: string;
	name: string;
	location: string | null;
	starts_on: string | null;
	ends_on: string | null;
	notes: string | null;
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

const InventoryManager = () => {
	const router = useRouter();
	const { permissions, loading, session } = usePermissions();
	const canManage = permissions.has('inventory.manage');

	const [users, setUsers] = useState<PersonOption[]>([]);
	const [items, setItems] = useState<Item[]>([]);
	const [events, setEvents] = useState<EventRow[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [itemForm, setItemForm] = useState<ItemForm | null>(null);
	const [eventForm, setEventForm] = useState<EventForm | null>(null);
	const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);

	useEffect(() => {
		if (loading) return;
		if (!session) {
			router.replace('/login?next=/dashboard/inventory');
			return;
		}
		if (!canManage) {
			router.replace('/dashboard');
			return;
		}
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
	}, [loading, session, canManage, router, refreshKey]);

	const personName = (userId: string | null, label: string | null): string => {
		if (userId) return users.find((u) => u.id === userId)?.username ?? userId.slice(0, 8);
		return label ?? '—';
	};

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
			setError('Naam is verplicht.');
			return;
		}
		const { error: err } = await getBrowserClient().from('inventory_items').upsert(payload);
		if (err) {
			setError(err.message);
			return;
		}
		setError(null);
		setItemForm(null);
		setRefreshKey((key) => key + 1);
	};

	const deleteItem = async (id: string) => {
		const { error: err } = await getBrowserClient().from('inventory_items').delete().eq('id', id);
		if (err) {
			setError(err.message);
			return;
		}
		setRefreshKey((key) => key + 1);
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
			setError('Naam is verplicht.');
			return;
		}
		const { error: err } = await getBrowserClient().from('events').upsert(payload);
		if (err) {
			setError(err.message);
			return;
		}
		setError(null);
		setEventForm(null);
		setRefreshKey((key) => key + 1);
	};

	const deleteEvent = async (id: string) => {
		const { error: err } = await getBrowserClient().from('events').delete().eq('id', id);
		if (err) {
			setError(err.message);
			return;
		}
		if (selectedEvent?.id === id) setSelectedEvent(null);
		setRefreshKey((key) => key + 1);
	};

	if (loading || !session || !canManage) {
		return (
			<Container element="main" className="inventory">
				<Spinner label="Inventory laden" />
			</Container>
		);
	}

	const itemRows: ReactNode[][] = items.map((item) => [
		item.name,
		personName(item.owner_user_id, item.owner_label),
		String(item.quantity),
		item.value_eur !== null ? `€ ${item.value_eur.toFixed(2)}` : '—',
		item.available ? 'Ja' : 'Nee',
		<span key="a" className="inventory-row-actions">
			<Button variant="secondary" onClick={() => setItemForm({ id: item.id, name: item.name, owner: { userId: item.owner_user_id, label: item.owner_label }, quantity: String(item.quantity), value_eur: item.value_eur?.toString() ?? '', available: item.available, notes: item.notes ?? '' })}>
				Bewerk
			</Button>
			<Button variant="ghost" icon="trash" onClick={() => deleteItem(item.id)}>
				Verwijder
			</Button>
		</span>,
	]);

	const eventRows: ReactNode[][] = events.map((event) => [
		event.name,
		event.location ?? '—',
		[event.starts_on, event.ends_on].filter(Boolean).join(' – ') || '—',
		<span key="a" className="inventory-row-actions">
			<Button variant="primary" onClick={() => setSelectedEvent(event)}>
				Beheer
			</Button>
			<Button variant="secondary" onClick={() => setEventForm({ id: event.id, name: event.name, location: event.location ?? '', starts_on: event.starts_on ?? '', ends_on: event.ends_on ?? '', notes: event.notes ?? '' })}>
				Bewerk
			</Button>
			<Button variant="ghost" icon="trash" onClick={() => deleteEvent(event.id)}>
				Verwijder
			</Button>
		</span>,
	]);

	return (
		<Container element="main" className="inventory">
			<Title size={2}>Inventory &amp; conventies</Title>
			{error && (
				<Alert variant="error" title="Er ging iets mis">
					{error}
				</Alert>
			)}

			<section className="inventory-section">
				<div className="inventory-toolbar">
					<Title size={4}>Items</Title>
					<Button variant="primary" icon="plus" onClick={() => setItemForm({ ...EMPTY_ITEM })}>
						Nieuw item
					</Button>
				</div>
				<Table
					columns={[{ header: 'Naam' }, { header: 'Eigenaar' }, { header: 'Aantal', align: 'center' }, { header: 'Waarde' }, { header: 'Beschikbaar', align: 'center' }, { header: '' }]}
					rows={itemRows}
				/>
			</section>

			<section className="inventory-section">
				<div className="inventory-toolbar">
					<Title size={4}>Conventies</Title>
					<Button variant="primary" icon="plus" onClick={() => setEventForm({ ...EMPTY_EVENT })}>
						Nieuwe conventie
					</Button>
				</div>
				<Table columns={[{ header: 'Naam' }, { header: 'Locatie' }, { header: 'Datum' }, { header: '' }]} rows={eventRows} />
			</section>

			{selectedEvent && (
				<EventDetail event={selectedEvent} items={items} users={users} onClose={() => setSelectedEvent(null)} onError={setError} />
			)}

			<Modal open={itemForm !== null} onOpenChange={(open) => !open && setItemForm(null)} title={itemForm?.id ? 'Item bewerken' : 'Nieuw item'} size="m"
				footer={<><Button variant="secondary" onClick={() => setItemForm(null)}>Annuleren</Button><Button variant="primary" onClick={saveItem}>Opslaan</Button></>}>
				{itemForm && (
					<div className="inventory-form">
						<Field name="name"><Field.Label>Naam</Field.Label><TextInput value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.currentTarget.value })} /></Field>
						<PersonPicker labelText="Eigenaar" users={users} value={itemForm.owner} onChange={(owner) => setItemForm({ ...itemForm, owner })} />
						<Field name="quantity"><Field.Label>Aantal</Field.Label><TextInput type="number" value={itemForm.quantity} onChange={(e) => setItemForm({ ...itemForm, quantity: e.currentTarget.value })} /></Field>
						<Field name="value"><Field.Label>Waarde (€)</Field.Label><TextInput type="number" value={itemForm.value_eur} onChange={(e) => setItemForm({ ...itemForm, value_eur: e.currentTarget.value })} /></Field>
						<Checkbox checked={itemForm.available} onCheckedChange={(available) => setItemForm({ ...itemForm, available })} label="Beschikbaar" />
						<Field name="notes"><Field.Label>Notities</Field.Label><TextArea value={itemForm.notes} onChange={(e) => setItemForm({ ...itemForm, notes: e.currentTarget.value })} /></Field>
					</div>
				)}
			</Modal>

			<Modal open={eventForm !== null} onOpenChange={(open) => !open && setEventForm(null)} title={eventForm?.id ? 'Conventie bewerken' : 'Nieuwe conventie'} size="m"
				footer={<><Button variant="secondary" onClick={() => setEventForm(null)}>Annuleren</Button><Button variant="primary" onClick={saveEvent}>Opslaan</Button></>}>
				{eventForm && (
					<div className="inventory-form">
						<Field name="name"><Field.Label>Naam</Field.Label><TextInput value={eventForm.name} onChange={(e) => setEventForm({ ...eventForm, name: e.currentTarget.value })} /></Field>
						<Field name="location"><Field.Label>Locatie</Field.Label><TextInput value={eventForm.location} onChange={(e) => setEventForm({ ...eventForm, location: e.currentTarget.value })} /></Field>
						<Field name="starts"><Field.Label>Startdatum</Field.Label><TextInput type="date" value={eventForm.starts_on} onChange={(e) => setEventForm({ ...eventForm, starts_on: e.currentTarget.value })} /></Field>
						<Field name="ends"><Field.Label>Einddatum</Field.Label><TextInput type="date" value={eventForm.ends_on} onChange={(e) => setEventForm({ ...eventForm, ends_on: e.currentTarget.value })} /></Field>
						<Field name="notes"><Field.Label>Notities</Field.Label><TextArea value={eventForm.notes} onChange={(e) => setEventForm({ ...eventForm, notes: e.currentTarget.value })} /></Field>
					</div>
				)}
			</Modal>
		</Container>
	);
};

export default InventoryManager;
