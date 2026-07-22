'use client';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import { formatDate } from '@/lib/formatDate';

// The "Betrokkenen"-context strip on a moderation profile (blueprint §1e): a compact, read-only glance at
// where this person shows up across the platform — recent conventions, stand shifts, and the people they
// shared support tickets with — each deep-linking to the surface that owns it. All rows are data the RLS
// policies already expose; nothing here mutates.

export interface BetrokkenenEvent {
	eventId: string;
	eventName: string;
	status: string;
}
export interface BetrokkenenShift {
	id: string;
	eventId: string;
	eventName: string;
	startsAt: string;
	station: string | null;
}
export interface BetrokkenenPeer {
	subjectId: string | null;
	name: string;
	tickets: number;
}

interface Props {
	events: BetrokkenenEvent[];
	shifts: BetrokkenenShift[];
	peers: BetrokkenenPeer[];
}

const Column = ({ icon, title, empty, children }: { icon: string; title: string; empty: boolean; children: React.ReactNode }) => (
	<div className="betrokken-col">
		<h4 className="betrokken-col-title">
			<Icon name={icon} />
			{title}
		</h4>
		{empty ? <p className="field-note">Niets gevonden.</p> : <ul className="betrokken-list">{children}</ul>}
	</div>
);

const BetrokkenenPanel = ({ events, shifts, peers }: Props) => {
	// Nothing to show at all → don't take up vertical space with three empty columns.
	if (events.length === 0 && shifts.length === 0 && peers.length === 0) return null;

	return (
		<section className="betrokken" aria-label="Betrokkenen">
			<Column icon="calendar" title="Recente events" empty={events.length === 0}>
				{events.slice(0, 4).map((event) => (
					<li key={event.eventId}>
						<Interactive url={`/dashboard/events?id=${event.eventId}`} className="betrokken-link">
							<span className="betrokken-link-main">{event.eventName}</span>
							<span className="field-note">{event.status}</span>
						</Interactive>
					</li>
				))}
			</Column>

			<Column icon="clock" title="Shifts" empty={shifts.length === 0}>
				{shifts.slice(0, 4).map((shift) => (
					<li key={shift.id}>
						<Interactive url={`/dashboard/events?id=${shift.eventId}`} className="betrokken-link">
							<span className="betrokken-link-main">{shift.eventName}</span>
							<span className="field-note">
								{formatDate(shift.startsAt, { dateStyle: 'medium' }) ?? shift.startsAt}
								{shift.station ? ` · ${shift.station}` : ''}
							</span>
						</Interactive>
					</li>
				))}
			</Column>

			<Column icon="users" title="Gedeelde tickets" empty={peers.length === 0}>
				{peers.slice(0, 5).map((peer, index) => {
					const label = `${peer.tickets} ${peer.tickets === 1 ? 'ticket' : 'tickets'}`;
					const inner = (
						<>
							<span className="betrokken-link-main">{peer.name}</span>
							<span className="field-note">{label}</span>
						</>
					);
					return (
						<li key={peer.subjectId ?? `${peer.name}-${index}`}>
							{peer.subjectId ? (
								<Interactive url={`/dashboard/moderation?id=${peer.subjectId}`} className="betrokken-link">
									{inner}
								</Interactive>
							) : (
								<span className="betrokken-link is-static">{inner}</span>
							)}
						</li>
					);
				})}
			</Column>
		</section>
	);
};

export default BetrokkenenPanel;
