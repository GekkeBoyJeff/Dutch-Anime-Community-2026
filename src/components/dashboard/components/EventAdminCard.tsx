import Badge from '@/components/basics/Badge';
import Icon from '@/components/basics/Icon';
import Skeleton from '@/components/basics/Skeleton';
import StatusBadge from '@/components/basics/StatusBadge';
import Menu from '@/components/components/Menu';
import RowActions, { RowActionItems, type RowAction } from '@/components/dashboard/components/RowActions';
import { formatDate } from '@/lib/formatDate';

export interface EventAdminCardProps {
	name: string;
	location?: string | null;
	startsOn: string | null;
	endsOn?: string | null;
	status: 'upcoming' | 'past';
	archived?: boolean;
	compact?: boolean;
	loading?: boolean;
	onManage: () => void;
	onEdit?: () => void;
	onArchive?: () => void;
	onRestore?: () => void;
	onDelete?: () => void;
}

/**
 * One convention as an admin card: a date chip, name, location + date range, a status badge and the
 * row's actions. Purely presentational — dates arrive as ISO strings and are formatted here; a missing
 * action callback hides its button. `loading` renders the pre-sized skeleton twin so nothing shifts.
 */
const EventAdminCard = ({
	name,
	location,
	startsOn,
	endsOn,
	status,
	archived = false,
	compact = false,
	loading = false,
	onManage,
	onEdit,
	onArchive,
	onRestore,
	onDelete,
}: EventAdminCardProps) => {
	const className = `event-card-admin${compact ? ' is-compact' : ''}${status === 'past' ? ' is-past' : ''}`;

	if (loading) {
		return (
			<article className={`${className} is-skeleton`} aria-hidden="true">
				<header className="head">
					<Skeleton width="3rem" height="3rem" radius="m" />
					<Skeleton width="5rem" height="1.25rem" radius="full" />
				</header>
				<div className="body">
					<Skeleton width="70%" height="1.2rem" />
					<Skeleton width="50%" height="0.9rem" />
				</div>
				<footer className="actions">
					<Skeleton width="4.5rem" height="2rem" radius="m" />
					<Skeleton width="4rem" height="2rem" radius="m" />
				</footer>
			</article>
		);
	}

	const past = status === 'past';
	const day = startsOn ? formatDate(startsOn, { day: 'numeric' }) : undefined;
	const month = startsOn ? formatDate(startsOn, { month: 'short' }) : undefined;
	const range = [startsOn, endsOn]
		.filter(Boolean)
		.map((d) => formatDate(d as string, { dateStyle: 'medium' }) ?? d)
		.join(' – ');

	// One action list, shared by the footer overflow menu and the card's right-click menu. Beheer stays a
	// pinned button; the rest fold into "⋯"; a missing callback drops its action; delete is danger-styled.
	const actions: RowAction[] = [{ label: 'Beheer', pinned: true, variant: 'primary', onClick: onManage }];
	if (archived) {
		if (onRestore) actions.push({ label: 'Herstellen', onClick: onRestore });
	} else {
		if (onEdit) actions.push({ label: 'Bewerk', onClick: onEdit });
		if (onArchive) actions.push({ label: 'Archiveren', onClick: onArchive });
	}
	if (onDelete) actions.push({ label: 'Verwijder', icon: 'trash', danger: true, onClick: onDelete });

	const card = (
		<article className={className}>
			<header className="head">
				<span className="date-badge" aria-hidden="true">
					{day ? (
						<>
							<span className="day">{day}</span>
							<span className="month">{month}</span>
						</>
					) : (
						<span className="tbd">?</span>
					)}
				</span>
				<span className="badges">
					<StatusBadge domain="request" status={past ? 'cancelled' : 'active'} label={past ? 'Verlopen' : 'Aankomend'} />
					{archived && <Badge variant="neutral">Gearchiveerd</Badge>}
				</span>
			</header>

			<div className="body">
				<h3 className="title">{name}</h3>
				<p className="meta">
					<span className="metaline">
						<Icon name="map-pin" className="icon" aria-hidden="true" />
						{location ?? 'Locatie onbekend'}
					</span>
					{range && (
						<span className="metaline">
							<Icon name="calendar" className="icon" aria-hidden="true" />
							{range}
						</span>
					)}
				</p>
			</div>

			<footer className="actions">
				<RowActions actions={actions} />
			</footer>
		</article>
	);

	return (
		<Menu.Context trigger={card} label="Kaart-acties">
			<RowActionItems actions={actions} />
		</Menu.Context>
	);
};

export default EventAdminCard;
