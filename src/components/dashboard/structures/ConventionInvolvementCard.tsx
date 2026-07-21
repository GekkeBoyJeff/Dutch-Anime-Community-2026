import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import Entry from '@/components/components/Entry';
import Switch from '@/components/components/Switch';

export interface ConventionAssignment {
	id: string;
	name: string;
	quantity: number;
	expectedToBring: boolean;
	notes: string | null;
	packed: boolean;
}
export interface ConventionTicket {
	id: string;
	day: string | null;
	quantity: number;
	pdfPath: string | null;
	/** Fallback text shown when there is no PDF to download. */
	note: string | null;
}
export interface ConventionShift {
	id: string;
	/** Pre-formatted time range. */
	time: string;
	station: string | null;
}

interface ConventionInvolvementCardProps {
	eventName: string;
	assignments: ConventionAssignment[];
	tickets: ConventionTicket[];
	shifts: ConventionShift[];
	onTogglePacked: (id: string, packed: boolean) => void;
	onDownloadTicket: (path: string) => void;
}

/**
 * One convention's personal involvement: the items you must bring (with a packed toggle), the tickets
 * you hold (download or a fallback note) and your shifts. Presentational — display names, event name
 * and time ranges are resolved by the caller, which also owns every query and mutation.
 */
const ConventionInvolvementCard = ({ eventName, assignments, tickets, shifts, onTogglePacked, onDownloadTicket }: ConventionInvolvementCardProps) => (
	<article className="convention-involvement-card">
		<Title element="h4" size={5} value={eventName} />
		{assignments.length > 0 && (
			<div className="block">
				<Title element="h5" size={6} value="Meenemen" />
				<Entry.List>
					{assignments.map((a) => (
						<Entry
							key={a.id}
							main={`${a.name} × ${a.quantity}`}
							sub={a.notes || undefined}
							trailing={
								<>
									<StatusBadge domain="request" status={a.expectedToBring ? 'requested' : 'cancelled'} label={a.expectedToBring ? 'Meenemen' : 'Optioneel'} />
									<label className="con-packed">
										<Switch checked={a.packed} aria-label={`${a.name} ingepakt`} onCheckedChange={(on) => onTogglePacked(a.id, on)} />
										Ingepakt
									</label>
								</>
							}
						/>
					))}
				</Entry.List>
			</div>
		)}
		{tickets.length > 0 && (
			<div className="block">
				<Title element="h5" size={6} value="Tickets" />
				<Entry.List>
					{tickets.map((t) => (
						<Entry
							key={t.id}
							main={`${t.day ?? 'Ticket'}${t.quantity > 1 ? ` × ${t.quantity}` : ''}`}
							trailing={
								t.pdfPath ? (
									<Button variant="secondary" icon="download" onClick={() => onDownloadTicket(t.pdfPath as string)}>
										Download PDF
									</Button>
								) : (
									<span className="con-note">{t.note}</span>
								)
							}
						/>
					))}
				</Entry.List>
			</div>
		)}
		{shifts.length > 0 && (
			<div className="block">
				<Title element="h5" size={6} value="Mijn shifts" />
				<Entry.List>
					{shifts.map((s) => (
						<Entry key={s.id} main={s.time} trailing={s.station ? <span className="con-note">{s.station}</span> : undefined} />
					))}
				</Entry.List>
			</div>
		)}
	</article>
);

export default ConventionInvolvementCard;
