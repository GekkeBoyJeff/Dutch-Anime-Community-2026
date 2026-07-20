import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import LineList from '@/components/dashboard/components/LineList';

export interface UnavailabilityWindow {
	id: string;
	starts_on: string;
	ends_on: string | null;
	reason: string | null;
	status: string;
}

const STATUS_META: Record<string, { label: string; variant: 'warning' | 'info' | 'neutral' }> = {
	active: { label: 'Actief', variant: 'warning' },
	requested: { label: 'Aangevraagd', variant: 'info' },
	rejected: { label: 'Afgewezen', variant: 'neutral' },
};

interface UnavailabilityWindowListProps {
	windows: UnavailabilityWindow[];
	emptyLabel?: string;
	/** Approve/reject a `requested` window. Omit for a read-only list. */
	onDecide?: (id: string, approve: boolean) => void;
	/** Remove a window. Omit for a read-only list. */
	onRemove?: (id: string) => void;
}

/**
 * A list of an item's unavailability windows: date range over an optional reason, with a status badge
 * and — when the callbacks are given — approve/reject (for a requested window) and remove actions.
 * Presentational, built on LineList; read-only when no callbacks are supplied.
 */
const UnavailabilityWindowList = ({ windows, emptyLabel = 'Geen onbeschikbaarheidsvensters.', onDecide, onRemove }: UnavailabilityWindowListProps) => (
	<LineList
		emptyLabel={emptyLabel}
		items={windows.map((w) => ({
			main: `${w.starts_on} – ${w.ends_on ?? 'onbepaald'}`,
			note: w.reason || undefined,
			meta: (
				<>
					<Badge variant={STATUS_META[w.status]?.variant ?? 'neutral'}>{STATUS_META[w.status]?.label ?? w.status}</Badge>
					{w.status === 'requested' && onDecide && (
						<>
							<Button variant="primary" onClick={() => onDecide(w.id, true)}>
								Goedkeuren
							</Button>
							<Button variant="ghost" onClick={() => onDecide(w.id, false)}>
								Afwijzen
							</Button>
						</>
					)}
					{onRemove && (
						<Button variant="ghost" icon="trash" onClick={() => onRemove(w.id)}>
							Verwijder
						</Button>
					)}
				</>
			),
		}))}
	/>
);

export default UnavailabilityWindowList;
