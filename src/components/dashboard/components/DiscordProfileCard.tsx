import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';
import DescriptionList from '@/components/components/DescriptionList';
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
const DiscordProfileCard = ({ profile }: DiscordProfileCardProps) => {
	const items = profile === null ? [] : [
		{ term: 'Gebruikersnaam', description: profile.username ?? '—' },
		...(profile.globalName ? [{ term: 'Weergavenaam', description: profile.globalName }] : []),
		...(profile.guildNick ? [{ term: 'Bijnaam in de server', description: profile.guildNick }] : []),
		{ term: 'Serverrollen', description: profile.roleCount > 0 ? `${profile.roleCount} rol(len)` : 'Geen' },
		...(profile.joinedAt ? [{ term: 'Lid sinds', description: formatDate(profile.joinedAt, { dateStyle: 'medium' }) ?? profile.joinedAt }] : []),
	];

	return (
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
					<DescriptionList items={items} />
					<span className="field-note">Discord-gegevens worden bij elke login automatisch bijgewerkt.</span>
				</div>
			)}
		</section>
	);
};

export default DiscordProfileCard;
