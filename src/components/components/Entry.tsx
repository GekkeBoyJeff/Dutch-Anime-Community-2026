import type { ReactNode, Ref } from 'react';

import Interactive from '@/components/basics/Interactive';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/classNames';

import type { Tone } from './tone';

export interface EntryProps {
	/** Primary label */
	main: ReactNode;
	/** Secondary line below the main label */
	sub?: ReactNode;
	/** Leading marker — an Icon, a coloured chip, an Avatar */
	marker?: ReactNode;
	/** Tints the marker rail; carries meaning, never decoration */
	tone?: Tone;
	/** Trailing slot — a StatusBadge, an amount, a row action */
	trailing?: ReactNode;
	/** Makes the whole row navigate */
	href?: string;
	/** Renders a row-shaped placeholder instead of the content */
	loading?: boolean;
	className?: string;
}

interface EntryListProps {
	children?: ReactNode;
	className?: string;
	ref?: Ref<HTMLUListElement>;
}

const EntryList = ({ children, className, ref }: EntryListProps) => (
	<ul ref={ref} className={classNames('entry-list', className)}>
		{children}
	</ul>
);

// One row of data: a leading marker, a main label over an optional sub-line, and a trailing slot.
// Renders an <li> — compose it inside Entry.List, which owns the dividers.
const Entry = ({ main, sub, marker, tone = 'neutral', trailing, href, loading = false, className, ref }: EntryProps & { ref?: Ref<HTMLLIElement> }) => {
	const body = (
		<>
			{marker && (
				<span className="entry-marker" aria-hidden="true">
					{marker}
				</span>
			)}
			<span className="entry-info">
				<span className="entry-main">{loading ? <Skeleton height="0.95rem" width="70%" /> : main}</span>
				{(sub !== undefined || loading) && <span className="entry-sub">{loading ? <Skeleton height="0.8rem" width="45%" /> : sub}</span>}
			</span>
			{trailing !== undefined && !loading && <span className="entry-trailing">{trailing}</span>}
		</>
	);

	return (
		<li ref={ref} className={classNames('entry', `is-${tone}`, loading && 'is-loading', className)} aria-hidden={loading || undefined}>
			{href && !loading ? (
				<Interactive url={href} className="entry-link">
					{body}
				</Interactive>
			) : (
				body
			)}
		</li>
	);
};

Entry.List = EntryList;

export default Entry;
