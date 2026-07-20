import Avatar from '@/components/basics/Avatar';
import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Icon from '@/components/basics/Icon';
import { ROLE_LABELS, type AppRole } from '@/lib/auth/permissions';

export interface TeamMember {
	displayName: string;
	avatarUrl?: string | null;
	discordTag?: string | null;
	role: AppRole;
	nextShiftAt?: string | null;
	nextShiftEventName?: string | null;
	openWarnings: number;
}

interface TeamMemberCardProps {
	member: TeamMember;
	onOpenModeration?: () => void;
	onOpenShift?: () => void;
}

const fmt = (iso: string): string => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });

const initialsOf = (name: string): string =>
	name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('');

/**
 * One staff member as a card: avatar, name and Discord tag with a role badge, a next-shift line and an
 * open-warnings line, plus optional moderation/shift actions. An omitted callback hides its button.
 */
const TeamMemberCard = ({ member, onOpenModeration, onOpenShift }: TeamMemberCardProps) => (
	<article className="team-member-card">
		<header className="head">
			<Avatar size="l" src={member.avatarUrl ?? undefined} alt={member.displayName} initials={initialsOf(member.displayName)} />
			<div className="ident">
				<h3 className="name">{member.displayName}</h3>
				<span className="tag">{member.discordTag ? `@${member.discordTag}` : '—'}</span>
			</div>
			<Badge variant={member.role === 'yakuza' ? 'info' : 'neutral'}>{ROLE_LABELS[member.role]}</Badge>
		</header>
		<div className="meta">
			<span className="metaline">
				<Icon name="calendar" className="icon" aria-hidden="true" />
				{member.nextShiftAt ? (
					<span>
						<strong>{fmt(member.nextShiftAt)}</strong>
						{member.nextShiftEventName && <span className="sub"> · {member.nextShiftEventName}</span>}
					</span>
				) : (
					<span className="sub">Geen shift gepland</span>
				)}
			</span>
			{member.openWarnings > 0 && (
				<span className="metaline is-warning">
					<Icon name="warning" className="icon" aria-hidden="true" />
					<span>
						{member.openWarnings} open warning{member.openWarnings === 1 ? '' : 's'}
					</span>
				</span>
			)}
		</div>
		<footer className="actions">
			{onOpenModeration && (
				<Button variant="secondary" onClick={onOpenModeration}>
					Bekijk in moderatie
				</Button>
			)}
			{onOpenShift && (
				<Button variant="secondary" onClick={onOpenShift}>
					Shift
				</Button>
			)}
		</footer>
	</article>
);

export default TeamMemberCard;
