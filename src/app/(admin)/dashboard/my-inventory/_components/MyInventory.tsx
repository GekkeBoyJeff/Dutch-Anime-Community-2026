'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import Switch from '@/components/components/Switch';
import Field from '@/components/forms/Field';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
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
// (add + toggle availability), and see per convention what you must bring and which tickets you hold —
// grouped by convention (mobile-first) so it's the kernel of the later "Mijn conventie"-page.
const MyInventory = () => {
	const { ready, fallback, session } = useDashboardGuard('inventory.view', { className: 'inventory', label: 'Laden' });

	const [items, setItems] = useState<Item[]>([]);
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [eventNames, setEventNames] = useState<Map<string, string>>(new Map());
	const [refreshKey, setRefreshKey] = useState(0);
	const [ownForm, setOwnForm] = useState<OwnItemForm | null>(null);
	const toast = Toast.useToastManager();

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		// Explicitly scope to the current user: a manager's RLS would otherwise return ALL rows here,
		// making "mijn items/toewijzingen/tickets" show everyone's.
		Promise.all([
			db.from('inventory_items').select('*').eq('owner_user_id', session.user.id).order('name'),
			db.from('event_item_assignments').select('*').eq('assigned_user_id', session.user.id),
			db.from('event_tickets').select('*').eq('assigned_user_id', session.user.id).order('day'),
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
	}, [ready, session, refreshKey]);

	const toggleAvailable = async (item: Item) => {
		const { error: err } = await getBrowserClient().from('inventory_items').update({ available: !item.available }).eq('id', item.id);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((key) => key + 1);
		toast.add({ title: item.available ? 'Op niet-beschikbaar gezet' : 'Op beschikbaar gezet', type: 'success' });
	};

	const saveOwnItem = async () => {
		if (!ownForm || !session) return;
		if (!ownForm.name.trim()) {
			toast.add({ title: 'Naam is verplicht.', type: 'error' });
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
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setOwnForm(null);
		setRefreshKey((key) => key + 1);
		toast.add({ title: 'Item toegevoegd', type: 'success' });
	};

	const downloadTicket = async (path: string) => {
		const { data, error: err } = await getBrowserClient().storage.from('tickets').createSignedUrl(path, 120);
		if (err || !data) {
			toast.add({ title: 'Kon ticket niet openen', description: err?.message, type: 'error' });
			return;
		}
		window.open(data.signedUrl, '_blank', 'noopener');
	};

	const itemName = (id: string): string => items.find((i) => i.id === id)?.name ?? id.slice(0, 8);
	const eventName = (id: string): string => eventNames.get(id) ?? id.slice(0, 8);

	// One card per convention you're involved with — union of the events you must bring items to and the
	// events you hold tickets for.
	const conIds = useMemo(
		() => [...new Set([...assignments.map((a) => a.event_id), ...tickets.map((t) => t.event_id)])],
		[assignments, tickets],
	);

	if (!ready || !session) return fallback;

	const itemColumns: DataTableColumn<Item>[] = [
		{ key: 'name', header: 'Naam', sortable: true, sortValue: (item) => item.name, cell: (item) => item.name },
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
			cell: (item) => <Switch checked={item.available} aria-label={`${item.name} beschikbaar`} onCheckedChange={() => toggleAvailable(item)} />,
		},
	];

	return (
		<Container className="inventory">
			<Title size={2}>Mijn inventory &amp; conventies</Title>

			<section className="inventory-section">
				<div className="inventory-toolbar">
					<Title element="h3" size={4}>Mijn items</Title>
					<Button variant="primary" icon="plus" onClick={() => setOwnForm({ ...EMPTY_OWN })}>
						Nieuw item
					</Button>
				</div>
				<DataTable columns={itemColumns} data={items} empty={{ title: 'Nog geen items', description: 'Voeg je eerste item toe.' }} />
			</section>

			<section className="inventory-section">
				<Title element="h3" size={4}>Aankomende conventies</Title>
				{conIds.length === 0 ? (
					<Alert variant="info">Je hebt nog geen toewijzingen of tickets voor een conventie.</Alert>
				) : (
					<div className="con-groups">
						{conIds.map((id) => {
							const myAssignments = assignments.filter((a) => a.event_id === id);
							const myTickets = tickets.filter((t) => t.event_id === id);
							return (
								<article key={id} className="con-group">
									<Title element="h4" size={5} value={eventName(id)} />
									{myAssignments.length > 0 && (
										<div className="con-block">
											<Title element="h5" size={6} value="Meenemen" />
											<ul className="con-list">
												{myAssignments.map((a) => (
													<li key={a.id} className="con-line">
														<div className="con-line-info">
															<span className="con-line-main">
																{itemName(a.item_id)} × {a.quantity}
															</span>
															{a.notes && <span className="con-note">{a.notes}</span>}
														</div>
														<StatusBadge
															domain="request"
															status={a.expected_to_bring ? 'requested' : 'cancelled'}
															label={a.expected_to_bring ? 'Meenemen' : 'Optioneel'}
														/>
													</li>
												))}
											</ul>
										</div>
									)}
									{myTickets.length > 0 && (
										<div className="con-block">
											<Title element="h5" size={6} value="Tickets" />
											<ul className="con-list">
												{myTickets.map((t) => (
													<li key={t.id} className="con-line">
														<span className="con-line-main">
															{t.day ?? 'Ticket'}
															{t.quantity > 1 ? ` × ${t.quantity}` : ''}
														</span>
														{t.ticket_pdf_path ? (
															<Button variant="secondary" icon="download" onClick={() => downloadTicket(t.ticket_pdf_path as string)}>
																Download PDF
															</Button>
														) : (
															<span className="con-note">{t.note ?? TICKET_DEFAULT_NOTE}</span>
														)}
													</li>
												))}
											</ul>
										</div>
									)}
								</article>
							);
						})}
					</div>
				)}
			</section>

			<Drawer
				open={ownForm !== null}
				onOpenChange={(open) => !open && setOwnForm(null)}
				title="Nieuw item"
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setOwnForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={saveOwnItem}>
							Opslaan
						</Button>
					</>
				}
			>
				{ownForm && (
					<div className="inventory-form">
						<Field name="name">
							<Field.Label>Naam</Field.Label>
							<TextInput value={ownForm.name} onChange={(e) => setOwnForm({ ...ownForm, name: e.currentTarget.value })} />
						</Field>
						<Field name="qty">
							<Field.Label>Aantal</Field.Label>
							<TextInput type="number" value={ownForm.quantity} onChange={(e) => setOwnForm({ ...ownForm, quantity: e.currentTarget.value })} />
						</Field>
						<Field name="value">
							<Field.Label>Waarde (€)</Field.Label>
							<TextInput type="number" value={ownForm.value_eur} onChange={(e) => setOwnForm({ ...ownForm, value_eur: e.currentTarget.value })} />
						</Field>
						<Field name="notes">
							<Field.Label>Notities</Field.Label>
							<TextArea value={ownForm.notes} onChange={(e) => setOwnForm({ ...ownForm, notes: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>
		</Container>
	);
};

export default MyInventory;
