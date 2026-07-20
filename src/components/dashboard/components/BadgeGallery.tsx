import type { Ref } from 'react';

import { classNames } from '@/lib/classNames';

export interface BadgeGalleryItem {
	/** Badge name, shown as the tooltip and the initials fallback */
	title: string;
	/** Public URL of the badge thumbnail; falls back to the title's first letter when absent */
	imageUrl?: string;
}

export interface BadgeGalleryProps {
	badges: BadgeGalleryItem[];
	className?: string;
}

// A small strip of earned badges: a round thumbnail per badge, falling back to its first initial
// when it has no image. Presentational — the caller resolves storage URLs and owns the fetch.
const BadgeGallery = ({ badges, className, ref }: BadgeGalleryProps & { ref?: Ref<HTMLUListElement> }) => (
	<ul ref={ref} className={classNames('badge-gallery', className)}>
		{badges.map((badge) => (
			<li key={badge.title} className="badge-gallery-item" title={badge.title}>
				{badge.imageUrl ? (
					// eslint-disable-next-line @next/next/no-img-element -- public badge bucket, no next/image on a static export
					<img className="badge-gallery-image" src={badge.imageUrl} alt={badge.title} width={44} height={44} loading="lazy" />
				) : (
					<span className="badge-gallery-fallback" aria-hidden="true">
						{badge.title.slice(0, 1)}
					</span>
				)}
			</li>
		))}
	</ul>
);

export default BadgeGallery;
