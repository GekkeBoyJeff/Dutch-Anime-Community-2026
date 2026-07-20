import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';
import { formatDate } from '@/lib/formatDate';

export interface DiscordProfileCardData {
	username: string | null;
	globalName: string | null;
	guildNick: string | null;
	roleCount: number;
	joinedAt: string | null;
}

export interface DiscordProfileCardProps {
	/** `null` while the row is loading — shows a skeleton */
	profile: DiscordProfileCardData | null;
}

// The account page's "Discord" section: username/display-name/nick/role-count/joined-at, synced on
// every login. A Server Component — the skeleton is CSS-only, so nothing here needs a client boundary.
const DiscordProfileCard = ({ profile }: DiscordProfileCardProps) => (
	<section className="inventory-section">
		<Title element="h2" size={4}>Discord</Title>
		{profile === null ? (
			<div aria-hidden="true">
				<Skeleton width="70%" height="0.9rem" />
				<Skeleton width="55%" height="0.9rem" />
				<Skeleton width="60%" height="0.9rem" />
			</div>
		) : (
			<div className="reveal">
				<ul className="con-list">
					<li className="con-line">
						<span className="con-line-main">Gebruikersnaam</span>
						<span className="con-note">{profile.username ?? '—'}</span>
					</li>
					{profile.globalName && (
						<li className="con-line">
							<span className="con-line-main">Weergavenaam</span>
							<span className="con-note">{profile.globalName}</span>
						</li>
					)}
					{profile.guildNick && (
						<li className="con-line">
							<span className="con-line-main">Bijnaam in de server</span>
							<span className="con-note">{profile.guildNick}</span>
						</li>
					)}
					<li className="con-line">
						<span className="con-line-main">Serverrollen</span>
						<span className="con-note">{profile.roleCount > 0 ? `${profile.roleCount} rol(len)` : 'Geen'}</span>
					</li>
					{profile.joinedAt && (
						<li className="con-line">
							<span className="con-line-main">Lid sinds</span>
							<span className="con-note">{formatDate(profile.joinedAt, { dateStyle: 'medium' }) ?? profile.joinedAt}</span>
						</li>
					)}
				</ul>
				<span className="con-note">Discord-gegevens worden bij elke login automatisch bijgewerkt.</span>
			</div>
		)}
	</section>
);

export default DiscordProfileCard;
