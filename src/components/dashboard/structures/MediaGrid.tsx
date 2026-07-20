import Badge from '@/components/basics/Badge';
import Skeleton from '@/components/basics/Skeleton';
import EmptyState from '@/components/components/EmptyState';

export interface MediaGridItem {
	name: string;
	url: string;
	mimetype: string | null;
	/** Precomputed usage badge (e.g. "In gebruik" / "Ongebruikt") — the caller owns that logic */
	badge?: { variant: 'info' | 'warning' | 'neutral'; label: string };
}

export interface MediaGridProps {
	/** `null` while the bucket listing is loading */
	items: MediaGridItem[] | null;
	onSelect: (item: MediaGridItem) => void;
	/** Skeleton cell count while loading; defaults to 8 */
	skeletonCount?: number;
}

// Fixed aspect-ratio media grid: reserves each cell before the image (or skeleton) decodes, so the
// grid never reflows on load. PDFs render a text badge instead of a thumbnail. Presentational — the
// caller resolves storage URLs and precomputes each item's usage badge.
const MediaGrid = ({ items, onSelect, skeletonCount = 8 }: MediaGridProps) => {
	if (items === null) {
		return (
			<div className="media-grid" aria-hidden="true">
				{Array.from({ length: skeletonCount }, (_, i) => (
					<figure key={i} className="cell">
						<span className="thumb is-skeleton">
							<Skeleton width="100%" height="100%" radius="m" />
						</span>
					</figure>
				))}
			</div>
		);
	}

	if (items.length === 0) {
		return <EmptyState icon="upload" title="Nog geen media" description="Upload je eerste afbeelding of PDF hierboven." />;
	}

	return (
		<div className="media-grid is-revealed">
			{items.map((item) => (
				<figure key={item.name} className="cell">
					<button type="button" className="thumb" onClick={() => onSelect(item)} title={item.name}>
						{item.mimetype === 'application/pdf' ? (
							<span className="pdf">PDF</span>
						) : (
							// eslint-disable-next-line @next/next/no-img-element -- remote bucket thumbnail
							<img src={item.url} alt={item.name} loading="lazy" />
						)}
					</button>
					{item.badge && (
						<figcaption className="status">
							<Badge variant={item.badge.variant}>{item.badge.label}</Badge>
						</figcaption>
					)}
				</figure>
			))}
		</div>
	);
};

export default MediaGrid;
