import type { ReactNode, Ref } from 'react';

import Interactive from '@/components/basics/Interactive';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/classNames';

import type { Tone } from './tone';

export interface MomentProps {
	/** The time marker on the rail — a short date or clock time */
	marker: string;
	title: ReactNode;
	/** Supporting line: a time range, a place */
	meta?: ReactNode;
	/** Where this moment sits relative to now; dims what has passed and rings what is current */
	state?: 'past' | 'now' | 'upcoming';
	tone?: Tone;
	href?: string;
	trailing?: ReactNode;
	loading?: boolean;
	className?: string;
}

interface MomentListProps {
	children?: ReactNode;
	className?: string;
	ref?: Ref<HTMLOListElement>;
}

// Draws the vertical rail; each Moment paints its own segment of it.
const MomentList = ({ children, className, ref }: MomentListProps) => (
	<ol ref={ref} className={classNames('moment-list', className)}>
		{children}
	</ol>
);

// Something happening at a point in time: a marker on a rail, a title, and supporting meta. Stacked
// inside Moment.List the markers and their connecting segments become a real timeline, so a reader
// sees order and the gaps between entries instead of comparing dates.
const Moment = ({ marker, title, meta, state = 'upcoming', tone = 'neutral', href, trailing, loading = false, className, ref }: MomentProps & { ref?: Ref<HTMLLIElement> }) => {
	const body = (
		<>
			<span className="moment-body">
				<span className="moment-title">{loading ? <Skeleton height="1rem" width="65%" /> : title}</span>
				{(meta !== undefined || loading) && <span className="moment-meta">{loading ? <Skeleton height="0.8rem" width="40%" /> : meta}</span>}
			</span>
			{trailing !== undefined && !loading && <span className="moment-trailing">{trailing}</span>}
		</>
	);

	return (
		<li ref={ref} className={classNames('moment', `is-${state}`, `is-${tone}`, loading && 'is-loading', className)} aria-hidden={loading || undefined}>
			<span className="moment-rail" aria-hidden="true">
				<span className="moment-dot" />
			</span>
			<span className="moment-marker">{loading ? <Skeleton height="0.75rem" width="2.5rem" /> : marker}</span>
			{href && !loading ? (
				<Interactive url={href} className="moment-link">
					{body}
				</Interactive>
			) : (
				body
			)}
		</li>
	);
};

Moment.List = MomentList;

export default Moment;
