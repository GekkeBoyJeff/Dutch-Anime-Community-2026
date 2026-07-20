'use client';

import { useEffect, useState } from 'react';

import Button from '@/components/basics/Button';
import Modal from '@/components/components/Modal';
import PersonPicker, { type PersonOption, type PersonValue } from '@/components/dashboard/forms/PersonPicker';
import EventLogisticsPanel, { type EventAssignmentRow, type EventTicketRow } from '@/components/dashboard/structures/EventLogisticsPanel';
import Checkbox from '@/components/forms/Checkbox';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { compressPdf } from '@/lib/pdf/compressPdf';
import { getBrowserClient } from '@/lib/supabase/client';

interface EventRow {
	id: string;
	name: string;
}
interface ItemOption {
	id: string;
	name: string;
}
interface Assignment {
	id: string;
	item_id: string;
	assigned_user_id: string | null;
	assigned_label: string | null;
	quantity: number;
	expected_to_bring: boolean;
	notes: string | null;
}
interface Ticket {
	id: string;
	day: string | null;
	assigned_user_id: string | null;
	assigned_label: string | null;
	quantity: number;
	ticket_pdf_path: string | null;
	note: string | null;
}
interface AssignForm {
	item_id: string;
	person: PersonValue;
	quantity: string;
	expected_to_bring: boolean;
	notes: string;
}
interface TicketForm {
	day: string;
	person: PersonValue;
	quantity: string;
	note: string;
	file: File | null;
}

const EMPTY_ASSIGN = (itemId: string): AssignForm => ({ item_id: itemId, person: { userId: null, label: null }, quantity: '1', expected_to_bring: true, notes: '' });
const EMPTY_TICKET: TicketForm = { day: '', person: { userId: null, label: null }, quantity: '1', note: '', file: null };

// Per-convention detail: which items are assigned to whom (to bring) and per-day tickets (with an
// optional PDF stored in the private `tickets` bucket under <user_id>/…). Managers only (parent gates).
// Consumed by the events editor; the presentational tables live in EventLogisticsPanel.
const EventDetail = ({
	event,
	items,
	users,
	onClose,
	onError,
}: {
	event: EventRow;
	items: ItemOption[];
	users: PersonOption[];
	onClose: () => void;
	onError: (message: string) => void;
}) => {
	const [assignments, setAssignments] = useState<Assignment[]>([]);
	const [tickets, setTickets] = useState<Ticket[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [assignForm, setAssignForm] = useState<AssignForm | null>(null);
	const [ticketForm, setTicketForm] = useState<TicketForm | null>(null);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('event_item_assignments').select('*').eq('event_id', event.id),
			db.from('event_tickets').select('*').eq('event_id', event.id).order('day'),
		]).then(([{ data: assignRows }, { data: ticketRows }]) => {
			if (!active) return;
			setAssignments((assignRows ?? []) as Assignment[]);
			setTickets((ticketRows ?? []) as Ticket[]);
		});
		return () => {
			active = false;
		};
	}, [event.id, refreshKey]);

	const personName = (userId: string | null, label: string | null): string =>
		userId ? users.find((u) => u.id === userId)?.username ?? userId.slice(0, 8) : label ?? '—';
	const itemName = (id: string): string => items.find((i) => i.id === id)?.name ?? id.slice(0, 8);

	const saveAssignment = async () => {
		if (!assignForm) return;
		if (!assignForm.item_id) {
			onError('Kies een item.');
			return;
		}
		const { error } = await getBrowserClient().from('event_item_assignments').insert({
			event_id: event.id,
			item_id: assignForm.item_id,
			assigned_user_id: assignForm.person.userId,
			assigned_label: assignForm.person.userId ? null : assignForm.person.label,
			quantity: Number(assignForm.quantity) || 1,
			expected_to_bring: assignForm.expected_to_bring,
			notes: assignForm.notes.trim() || null,
		});
		if (error) {
			onError(error.message);
			return;
		}
		setAssignForm(null);
		setRefreshKey((key) => key + 1);
	};

	const saveTicket = async () => {
		if (!ticketForm) return;
		const db = getBrowserClient();
		let ticketPdfPath: string | null = null;
		if (ticketForm.file) {
			const pdf = await compressPdf(ticketForm.file); // best-effort; original on any failure
			const folder = ticketForm.person.userId ?? '_shared';
			const path = `${folder}/${Date.now()}-${pdf.name}`;
			const { error: upErr } = await db.storage.from('tickets').upload(path, pdf, { contentType: 'application/pdf', upsert: false });
			if (upErr) {
				onError(`PDF upload mislukt: ${upErr.message}`);
				return;
			}
			ticketPdfPath = path;
		}
		const { error } = await db.from('event_tickets').insert({
			event_id: event.id,
			day: ticketForm.day || null,
			assigned_user_id: ticketForm.person.userId,
			assigned_label: ticketForm.person.userId ? null : ticketForm.person.label,
			quantity: Number(ticketForm.quantity) || 1,
			ticket_pdf_path: ticketPdfPath,
			note: ticketForm.note.trim() || null,
		});
		if (error) {
			onError(error.message);
			return;
		}
		setTicketForm(null);
		setRefreshKey((key) => key + 1);
	};

	const deleteAssignment = async (id: string) => {
		const { error } = await getBrowserClient().from('event_item_assignments').delete().eq('id', id);
		if (error) {
			onError(error.message);
			return;
		}
		setRefreshKey((key) => key + 1);
	};

	const deleteTicket = async (id: string) => {
		const db = getBrowserClient();
		const ticket = tickets.find((t) => t.id === id);
		const { error } = await db.from('event_tickets').delete().eq('id', id);
		if (error) {
			onError(error.message);
			return;
		}
		// Remove the PDF too, so deleting a ticket doesn't orphan its object in the private bucket.
		if (ticket?.ticket_pdf_path) await db.storage.from('tickets').remove([ticket.ticket_pdf_path]);
		setRefreshKey((key) => key + 1);
	};

	const assignmentRows: EventAssignmentRow[] = assignments.map((a) => ({
		id: a.id,
		item: itemName(a.item_id),
		person: personName(a.assigned_user_id, a.assigned_label),
		quantity: a.quantity,
		expectedToBring: a.expected_to_bring,
		notes: a.notes,
	}));

	const ticketRows: EventTicketRow[] = tickets.map((t) => ({
		id: t.id,
		day: t.day,
		person: personName(t.assigned_user_id, t.assigned_label),
		quantity: t.quantity,
		detail: t.ticket_pdf_path ? 'PDF' : t.note ?? 'Wordt per bandje op de dag zelf geregeld',
	}));

	return (
		<>
			<EventLogisticsPanel
				eventName={event.name}
				assignments={assignmentRows}
				tickets={ticketRows}
				onClose={onClose}
				onAddAssignment={() => setAssignForm(EMPTY_ASSIGN(items[0]?.id ?? ''))}
				onAddTicket={() => setTicketForm({ ...EMPTY_TICKET })}
				onDeleteAssignment={deleteAssignment}
				onDeleteTicket={deleteTicket}
			/>

			<Modal open={assignForm !== null} onOpenChange={(open) => !open && setAssignForm(null)} title="Item toewijzen" size="m"
				footer={<><Button variant="secondary" onClick={() => setAssignForm(null)}>Annuleren</Button><Button variant="primary" onClick={saveAssignment}>Opslaan</Button></>}>
				{assignForm && (
					<div className="inventory-form">
						<Field name="item"><Field.Label>Item</Field.Label>
							<Select native aria-label="Item" value={assignForm.item_id} options={items.map((i) => ({ value: i.id, label: i.name }))} onValueChange={(v) => setAssignForm({ ...assignForm, item_id: v as string })} />
						</Field>
						<PersonPicker labelText="Toegewezen aan" users={users} value={assignForm.person} onChange={(person) => setAssignForm({ ...assignForm, person })} />
						<Field name="qty"><Field.Label>Aantal</Field.Label><TextInput type="number" value={assignForm.quantity} onChange={(e) => setAssignForm({ ...assignForm, quantity: e.currentTarget.value })} /></Field>
						<Checkbox checked={assignForm.expected_to_bring} onCheckedChange={(v) => setAssignForm({ ...assignForm, expected_to_bring: v })} label="Wordt verwacht mee te nemen" />
						<Field name="notes"><Field.Label>Notities</Field.Label><TextArea value={assignForm.notes} onChange={(e) => setAssignForm({ ...assignForm, notes: e.currentTarget.value })} /></Field>
					</div>
				)}
			</Modal>

			<Modal open={ticketForm !== null} onOpenChange={(open) => !open && setTicketForm(null)} title="Ticket toevoegen" size="m"
				footer={<><Button variant="secondary" onClick={() => setTicketForm(null)}>Annuleren</Button><Button variant="primary" onClick={saveTicket}>Opslaan</Button></>}>
				{ticketForm && (
					<div className="inventory-form">
						<Field name="day"><Field.Label>Dag</Field.Label><TextInput type="date" value={ticketForm.day} onChange={(e) => setTicketForm({ ...ticketForm, day: e.currentTarget.value })} /></Field>
						<PersonPicker labelText="Voor" users={users} value={ticketForm.person} onChange={(person) => setTicketForm({ ...ticketForm, person })} />
						<Field name="qty"><Field.Label>Aantal</Field.Label><TextInput type="number" value={ticketForm.quantity} onChange={(e) => setTicketForm({ ...ticketForm, quantity: e.currentTarget.value })} /></Field>
						<Field name="pdf"><Field.Label>Ticket-PDF (optioneel)</Field.Label><TextInput type="file" accept="application/pdf" onChange={(e) => setTicketForm({ ...ticketForm, file: e.currentTarget.files?.[0] ?? null })} /></Field>
						<Field name="note"><Field.Label>Notitie (leeg = per bandje op de dag zelf)</Field.Label><TextArea value={ticketForm.note} onChange={(e) => setTicketForm({ ...ticketForm, note: e.currentTarget.value })} /></Field>
					</div>
				)}
			</Modal>
		</>
	);
};

export default EventDetail;
