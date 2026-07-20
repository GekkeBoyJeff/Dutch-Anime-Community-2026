import type { ReactNode } from 'react';

import Button from '@/components/basics/Button';
import Title from '@/components/basics/Title';
import Table from '@/components/components/Table';

export interface EventAssignmentRow {
	id: string;
	item: string;
	person: string;
	quantity: number;
	expectedToBring: boolean;
	notes: string | null;
}
export interface EventTicketRow {
	id: string;
	day: string | null;
	person: string;
	quantity: number;
	/** Pre-resolved detail cell: "PDF", a note, or the fallback text */
	detail: string;
}

export interface EventLogisticsPanelProps {
	eventName: string;
	assignments: EventAssignmentRow[];
	tickets: EventTicketRow[];
	onClose: () => void;
	onAddAssignment: () => void;
	onAddTicket: () => void;
	onDeleteAssignment: (id: string) => void;
	onDeleteTicket: (id: string) => void;
}

// Per-convention logistics: a table of items assigned to people (to bring) and a table of per-day
// tickets. Presentational — the caller owns the queries, the assign/ticket forms and the PDF upload,
// and passes already-resolved person/item/detail strings.
const EventLogisticsPanel = ({ eventName, assignments, tickets, onClose, onAddAssignment, onAddTicket, onDeleteAssignment, onDeleteTicket }: EventLogisticsPanelProps) => {
	const assignmentRows: ReactNode[][] = assignments.map((a) => [
		a.item,
		a.person,
		String(a.quantity),
		a.expectedToBring ? 'Ja' : 'Nee',
		a.notes ?? '—',
		<Button key="d" variant="ghost" icon="trash" onClick={() => onDeleteAssignment(a.id)}>
			Verwijder
		</Button>,
	]);

	const ticketRows: ReactNode[][] = tickets.map((t) => [
		t.day ?? '—',
		t.person,
		String(t.quantity),
		t.detail,
		<Button key="d" variant="ghost" icon="trash" onClick={() => onDeleteTicket(t.id)}>
			Verwijder
		</Button>,
	]);

	return (
		<section className="inventory-section">
			<div className="inventory-toolbar">
				<Title size={4}>Beheer: {eventName}</Title>
				<Button variant="secondary" icon="close" onClick={onClose}>
					Sluiten
				</Button>
			</div>

			<div className="inventory-toolbar">
				<Title size={5}>Toegewezen items (mee te nemen)</Title>
				<Button variant="primary" icon="plus" onClick={onAddAssignment}>
					Item toewijzen
				</Button>
			</div>
			<Table
				columns={[{ header: 'Item' }, { header: 'Persoon' }, { header: 'Aantal', align: 'center' }, { header: 'Meenemen', align: 'center' }, { header: 'Notitie' }, { header: '' }]}
				rows={assignmentRows}
			/>

			<div className="inventory-toolbar">
				<Title size={5}>Tickets</Title>
				<Button variant="primary" icon="plus" onClick={onAddTicket}>
					Ticket toevoegen
				</Button>
			</div>
			<Table columns={[{ header: 'Dag' }, { header: 'Persoon' }, { header: 'Aantal', align: 'center' }, { header: 'PDF / notitie' }, { header: '' }]} rows={ticketRows} />
		</section>
	);
};

export default EventLogisticsPanel;
