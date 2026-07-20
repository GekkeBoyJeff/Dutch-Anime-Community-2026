import Button from '@/components/basics/Button';
import { formatDate } from '@/lib/formatDate';

export interface BadgeCardProps {
	imageUrl?: string;
	title: string;
	description?: string | null;
	awardedOn?: string;
	onArchive?: () => void;
}

/**
 * A single awarded badge: an optional image, the title, an optional description and an optional award
 * date, with an optional archive ("intrekken") action. Presentational — the date arrives as ISO and is
 * formatted here; omit it to hide the date line.
 */
const BadgeCard = ({ imageUrl, title, description, awardedOn, onArchive }: BadgeCardProps) => (
	<article className="badge-card">
		{/* eslint-disable-next-line @next/next/no-img-element -- public badges bucket, no next/image in static export */}
		{imageUrl && <img className="image" src={imageUrl} alt="" width={64} height={64} />}
		<span className="title">{title}</span>
		{description && <span className="description">{description}</span>}
		{awardedOn && <span className="date">{formatDate(awardedOn, { dateStyle: 'medium' }) ?? awardedOn}</span>}
		{onArchive && (
			<Button variant="ghost" onClick={onArchive}>
				Intrekken
			</Button>
		)}
	</article>
);

export default BadgeCard;
