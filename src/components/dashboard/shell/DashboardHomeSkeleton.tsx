import Skeleton from '@/components/basics/Skeleton';

// The hub's cold-load placeholder: the same outer boxes the loaded home renders (hero panel, then the
// two-column zone grid), so a slow connection sees the shell arriving rather than a bare spinner. Returns
// a fragment so the hero and zones sit directly in the guard's <Container className="dashboard"> grid —
// matching the loaded layout's outer boxes, so there is no shift when the real content resolves in.
const CardSkeleton = () => (
	<article className="async-card" aria-hidden="true">
		<header className="async-card-head">
			<Skeleton height="1rem" width="8rem" />
		</header>
		<div className="async-card-body">
			<div className="async-card-skeleton">
				<Skeleton height="1rem" />
				<Skeleton height="1rem" width="70%" />
			</div>
		</div>
	</article>
);

const DashboardHomeSkeleton = () => (
	<>
		<section className="home-hero" aria-hidden="true">
			<div className="home-hero-wash" />
			<header className="home-hero-top">
				<Skeleton height="0.9rem" width="11rem" />
				<div className="home-hero-tools">
					<Skeleton circle width="2.5rem" height="2.5rem" />
				</div>
			</header>
			<div className="home-hero-greet">
				<Skeleton height="2.4rem" width="min(20rem, 60%)" />
				<div className="home-hero-summary is-loading">
					<Skeleton height="1.35rem" width="min(24rem, 70%)" />
				</div>
			</div>
			<div className="home-hero-slot">
				<div className="home-card is-skeleton">
					<div className="home-card-body">
						<Skeleton height="0.85rem" width="9rem" />
						<Skeleton height="1.5rem" width="min(18rem, 80%)" />
						<Skeleton height="0.95rem" width="min(22rem, 90%)" />
					</div>
					<div className="home-card-actions">
						<Skeleton height="2.75rem" width="6rem" radius="m" />
						<Skeleton height="2.75rem" width="6rem" radius="m" />
					</div>
				</div>
			</div>
		</section>

		<div className="home-zones" aria-hidden="true">
			<section className="widget-zone home-zone-personal">
				<Skeleton height="1rem" width="6rem" />
				<div className="widget-grid">
					<CardSkeleton />
					<CardSkeleton />
				</div>
			</section>
			<section className="widget-zone home-zone-ambient">
				<Skeleton height="1rem" width="7rem" />
				<div className="home-ambient-stack">
					<CardSkeleton />
				</div>
			</section>
		</div>
	</>
);

export default DashboardHomeSkeleton;
