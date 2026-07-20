import type { ReactNode, Ref } from 'react';

import Button from '@/components/basics/Button';
import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';

export interface AsyncCardProps {
	/** Card heading */
	title: string;
	/** Deep link into the owning section, rendered as a trailing arrow in the header */
	href?: string;
	/** Accessible label for the deep link; defaults to `title` */
	linkLabel?: string;
	/** The query is still in flight — shows a skeleton body */
	loading: boolean;
	/** Set when the query failed; the message itself is not shown, only `errorLabel` is */
	error?: string | null;
	/** The query resolved with nothing actionable */
	isEmpty?: boolean;
	/** Shown when empty and the card stays visible */
	emptyLabel?: string;
	/** Shown when `error` is set */
	errorLabel?: string;
	/** Drop the whole card when it resolves empty, instead of showing `emptyLabel` */
	hideWhenEmpty?: boolean;
	className?: string;
	children?: ReactNode;
}

// The shared card frame for an async data widget: a titled surface with an optional deep link and
// the three async states (skeleton · quiet inline error · empty). A Server Component — Skeleton's
// shimmer is CSS-only, so nothing here needs a client boundary.
const AsyncCard = ({
	title,
	href,
	linkLabel,
	loading,
	error,
	isEmpty,
	emptyLabel = 'Niets te tonen',
	errorLabel = 'Kon niet laden.',
	hideWhenEmpty,
	className,
	children,
	ref,
}: AsyncCardProps & { ref?: Ref<HTMLElement> }) => {
	if (!loading && !error && isEmpty && hideWhenEmpty) return null;

	return (
		<article ref={ref} className={classNames('async-card', className)}>
			<header className="async-card-head">
				<Title element="h3" size={6} value={title} />
				{href && <Button variant="ghost" icon="arrow-right" iconStyle="badge" url={href} aria-label={linkLabel ?? title} className="async-card-link" />}
			</header>
			<div className="async-card-body">
				{loading ? (
					<div className="async-card-skeleton" aria-hidden="true">
						<Skeleton height="1rem" />
						<Skeleton height="1rem" width="70%" />
					</div>
				) : error ? (
					<p className="async-card-error">{errorLabel}</p>
				) : isEmpty ? (
					<p className="async-card-empty">{emptyLabel}</p>
				) : (
					<div className="async-card-content">{children}</div>
				)}
			</div>
		</article>
	);
};

export default AsyncCard;
