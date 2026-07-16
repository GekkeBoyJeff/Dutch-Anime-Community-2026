'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Spinner from '@/components/basics/Spinner';
import Title from '@/components/basics/Title';
import Modal from '@/components/components/Modal';
import Table from '@/components/components/Table';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { usePermissions } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';

interface Item {
	id: string;
	name: string;
	quantity: number;
	value_eur: number | null;
	available: boolean;
	notes: string | null;
}
interface Assignment {
	id: string;
	event_id: string;
	item_id: string;
	quantity: number;
	expected_to_bring: boolean;
	notes: string | null;
}
interface Ticket {
	id: string;
	event_id: string;
	day: string | null;
	quantity: number;
	ticket_pdf_path: string | null;
	note: string | null;
}
interface OwnItemForm {
	name: string;
	quantity: string;
	value_eur: string;
	notes: string;
}

const EMPTY_OWN: OwnItemForm = { name: '', quantity: '1', value_eur: '', notes: '' };
const TICKET_DEFAULT_NOTE = 'Wordt per bandje op de dag zelf geregeld.';

// The personal view for stand-staff / any member granted inventory.view: manage YOUR OWN items
// (add + toggle availability), see what you must bring per convention, and see your tickets.
const MyInventory = () => {
	const router = useRouter();
	const { permissions, loading, session } = usePermissions();
	const canView = permissions.has('inventory.view');

	const [items, setItems] = useState<Item[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [eventNames, setEventNames] = useState<Map<string, string>>(new Map());
	const [refreshKey, setRefreshKey] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const [ownForm, setOwnForm] = useState<OwnItemForm | null>(null);

	useEffect(() => {
		if (loading) return;
		if (!session) {
			router.replace('/login?next=/dashboard/my-inventory');
			return;
		}
		if (!canView) {
			router.replace('/dashboard');
			return;
		}
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('inventory_items').select('*').order('name'),
			db.from('event_item_assignments').select('*'),
			db.from('event_tickets').select('*').order('day'),
			db.from('events').select('id, name'),
		]).then(([{ data: itemRows }, { data: assignRows }, { data: ticketRows }, { data: eventRows }]) => {
			if (!active) return;
			setItems((itemRows ?? []) as Item[]);
			setAssignments((assignRows ?? []) as Assignment[]);
			setTickets((ticketRows ?? []) as Ticket[]);
			setEventNames(new Map((eventRows ?? []).map((e) => [e.id as string, e.name as string])));
		});
		return () => {
			active = false;
		};
	}, [loading, session, canView, router, refreshKey]);

	const toggleAvailable = async (item: Item) => {
		const { error: err } = await getBrowserClient().from('inventory_items').update({ available: !item.available }).eq('id', item.id);
		if (err) {
			setError(err.message);
			return;
		}
		setRefreshKey((key) => key + 1);
	};

	const saveOwnItem = async () => {
		if (!ownForm || !session) return;
		if (!ownForm.name.trim()) {
			setError('Naam is verplicht.');
			return;
		}
		const { error: err } = await getBrowserClient().from('inventory_items').insert({
			name: ownForm.name.trim(),
			owner_user_id: session.user.id,
			quantity: Number(ownForm.quantity) || 1,
			value_eur: ownForm.value_eur ? Number(ownForm.value_eur) : null,
			available: true,
			notes: ownForm.notes.trim() || null,
			created_by: session.user.id,
		});
		if (err) {
			setError(err.message);
			return;
		}
		setError(null);
		setOwnForm(null);
		setRefreshKey((key) => key + 1);
	};

	const downloadTicket = async (path: string) => {
		const { data, error: err } = await getBrowserClient().storage.from('tickets').createSignedUrl(path, 120);
		if (err || !data) {
			setError(err?.message ?? 'Kon ticket niet openen.');
			return;
		}
		window.open(data.signedUrl, '_blank', 'noopener');
	};

	const itemName = (id: string): string => items.find((i) => i.id === id)?.name ?? id.slice(0, 8);
	const eventName = (id: string): string => eventNames.get(id) ?? id.slice(0, 8);

	if (loading || !session || !canView) {
		return (
			<Container element="main" className="inventory">
				<Spinner label="Laden" />
			</Container>
		);
	}

	const itemRows: ReactNode[][] = items.map((item) => [
		item.name,
		String(item.quantity),
		item.value_eur !== null ? `€ ${item.value_eur.toFixed(2)}` : '—',
		item.available ? 'Ja' : 'Nee',
		<Button key="t" variant="secondary" onClick={() => toggleAvailable(item)}>
			{item.available ? 'Markeer niet-beschikbaar' : 'Markeer beschikbaar'}
		</Button>,
	]);

	const bringRows: ReactNode[][] = assignments.map((a) => [
		eventName(a.event_id),
		itemName(a.item_id),
		String(a.quantity),
		a.expected_to_bring ? 'Ja' : 'Nee',
		a.notes ?? '—',
	]);

	const ticketRows: ReactNode[][] = tickets.map((t) => [
		eventName(t.event_id),
		t.day ?? '—',
		String(t.quantity),
		t.ticket_pdf_path ? (
			<Button key="d" variant="secondary" icon="download" onClick={() => downloadTicket(t.ticket_pdf_path as string)}>
				Download PDF
			</Button>
		) : (
			t.note ?? TICKET_DEFAULT_NOTE
		),
	]);

	return (
		<Container element="main" className="inventory">
			<Title size={2}>Mijn inventory &amp; conventies</Title>
			{error && (
				<Alert variant="error" title="Er ging iets mis">
					{error}
				</Alert>
			)}

			<section className="inventory-section">
				<div className="inventory-toolbar">
					<Title size={4}>Mijn items</Title>
					<Button variant="primary" icon="plus" onClick={() => setOwnForm({ ...EMPTY_OWN })}>
						Nieuw item
					</Button>
				</div>
				<Table columns={[{ header: 'Naam' }, { header: 'Aantal', align: 'center' }, { header: 'Waarde' }, { header: 'Beschikbaar', align: 'center' }, { header: '' }]} rows={itemRows} />
			</section>

			<section className="inventory-section">
				<Title size={4}>Mee te nemen naar conventies</Title>
				<Table columns={[{ header: 'Conventie' }, { header: 'Item' }, { header: 'Aantal', align: 'center' }, { header: 'Meenemen', align: 'center' }, { header: 'Notitie' }]} rows={bringRows} />
			</section>

			<section className="inventory-section">
				<Title size={4}>Mijn tickets</Title>
				<Table columns={[{ header: 'Conventie' }, { header: 'Dag' }, { header: 'Aantal', align: 'center' }, { header: 'Ticket' }]} rows={ticketRows} />
			</section>

			<Modal open={ownForm !== null} onOpenChange={(open) => !open && setOwnForm(null)} title="Nieuw item" size="m"
				footer={<><Button variant="secondary" onClick={() => setOwnForm(null)}>Annuleren</Button><Button variant="primary" onClick={saveOwnItem}>Opslaan</Button></>}>
				{ownForm && (
					<div className="inventory-form">
						<Field name="name"><Field.Label>Naam</Field.Label><TextInput value={ownForm.name} onChange={(e) => setOwnForm({ ...ownForm, name: e.currentTarget.value })} /></Field>
						<Field name="qty"><Field.Label>Aantal</Field.Label><TextInput type="number" value={ownForm.quantity} onChange={(e) => setOwnForm({ ...ownForm, quantity: e.currentTarget.value })} /></Field>
						<Field name="value"><Field.Label>Waarde (€)</Field.Label><TextInput type="number" value={ownForm.value_eur} onChange={(e) => setOwnForm({ ...ownForm, value_eur: e.currentTarget.value })} /></Field>
						<Field name="notes"><Field.Label>Notities</Field.Label><TextArea value={ownForm.notes} onChange={(e) => setOwnForm({ ...ownForm, notes: e.currentTarget.value })} /></Field>
					</div>
				)}
			</Modal>
		</Container>
	);
};

export default MyInventory;
