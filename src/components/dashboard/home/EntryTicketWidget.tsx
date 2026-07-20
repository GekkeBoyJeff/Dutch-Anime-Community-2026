'use client';

import { Toast } from '@base-ui/react/toast';

import Button from '@/components/basics/Button';
import DetailRow from '@/components/dashboard/components/DetailRow';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

const WRISTBAND_NOTE = 'Wordt per bandje op de dag zelf geregeld.';

// Entry/ticket info for the member's soonest upcoming convention — surfaced on the home "Voor jou" zone
// so it isn't buried in an event tab (blueprint 1b: entry/ticket-info ▲ for stand-staff). Reads the same
// event_tickets rows MyInventory shows (assigned_user_id = me), scoped to the next event by starts_on, and
// opens each PDF through the existing signed-url flow on the private `tickets` bucket. No new data.
const EntryTicketWidget = ({ session }: WidgetProps) => {
	const toast = Toast.useToastManager();

	const { loading, error, data } = useWidgetData(async (db) => {
		const today = new Date().toISOString().slice(0, 10);
		const [ticketsRes, eventsRes] = await Promise.all([
			db.from('event_tickets').select('id, event_id, day, quantity, ticket_pdf_path, note').eq('assigned_user_id', session.user.id).order('day'),
			db.from('events').select('id, name, location, starts_on').is('archived_at', null),
		]);
		if (ticketsRes.error) throw ticketsRes.error;
		if (eventsRes.error) throw eventsRes.error;

		const eventById = new Map((eventsRes.data ?? []).map((e) => [e.id, e]));
		const ticketEventIds = new Set((ticketsRes.data ?? []).map((t) => t.event_id));
		const nextEvent = (eventsRes.data ?? [])
			.filter((e) => ticketEventIds.has(e.id) && e.starts_on !== null && e.starts_on >= today)
			.sort((a, b) => (a.starts_on! < b.starts_on! ? -1 : 1))[0];
		if (!nextEvent) return null;

		const tickets = (ticketsRes.data ?? []).filter((t) => t.event_id === nextEvent.id);
		return {
			eventName: nextEvent.name,
			eventMeta: [nextEvent.starts_on ? formatDate(nextEvent.starts_on, { dateStyle: 'medium' }) : null, eventById.get(nextEvent.id)?.location].filter(Boolean).join(' · '),
			tickets,
		};
	});

	const openTicket = async (path: string) => {
		const { data: signed, error: signError } = await getBrowserClient().storage.from('tickets').createSignedUrl(path, 120);
		if (signError || !signed) {
			toast.add({ title: 'Kon ticket niet openen', description: signError?.message, type: 'error' });
			return;
		}
		window.open(signed.signedUrl, '_blank', 'noopener');
	};

	return (
		<AsyncCard title="Toegang & tickets" href="/dashboard/my-inventory" linkLabel="Naar mijn conventies" loading={loading} error={error} isEmpty={!data} hideWhenEmpty>
			{data && (
				<div className="widget-tickets">
					<p className="widget-tickets-event">
						{data.eventName}
						{data.eventMeta && <span className="widget-tickets-event-meta"> · {data.eventMeta}</span>}
					</p>
					<ul className="widget-list">
						{data.tickets.map((ticket) => (
							<DetailRow
								key={ticket.id}
								main={ticket.day ? formatDate(ticket.day, { dateStyle: 'full' }) ?? ticket.day : 'Volledig evenement'}
								sub={ticket.ticket_pdf_path ? `${ticket.quantity}× ticket` : (ticket.note ?? WRISTBAND_NOTE)}
								trailing={
									ticket.ticket_pdf_path ? (
										<Button variant="secondary" icon="download" onClick={() => openTicket(ticket.ticket_pdf_path as string)}>
											Open
										</Button>
									) : undefined
								}
							/>
						))}
					</ul>
				</div>
			)}
		</AsyncCard>
	);
};

export default EntryTicketWidget;
