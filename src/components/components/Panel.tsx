import type { ReactNode, Ref } from 'react';

import Button from '@/components/basics/Button';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';

export interface PanelProps {
	/** Card heading */
	title: string;
	/** Deep link into the owning section, rendered as a trailing arrow in the header */
	href?: string;
	/** Accessible label for the deep link; defaults to `title` */
	linkLabel?: string;
	/** Extra header slot before the deep link (a filter, a menu) */
	action?: ReactNode;
	/** Set when the query failed; the message itself is not shown, only `errorLabel` is */
	error?: string | null;
	/** The query resolved with nothing actionable */
	isEmpty?: boolean;
	emptyLabel?: string;
	errorLabel?: string;
	/** Drop the whole card when it resolves empty, instead of showing `emptyLabel` */
	hideWhenEmpty?: boolean;
	className?: string;
	children?: ReactNode;
}

// The card frame around one or more facts: a titled surface with an optional deep link, plus the
// empty and error states. Loading is deliberately NOT its concern — each fact component renders its
// own skeleton in its own shape, so the card keeps its silhouette while data arrives.
const Panel = ({
	title,
	href,
	linkLabel,
	action,
	error,
	isEmpty,
	emptyLabel = 'Niets te tonen',
	errorLabel = 'Kon niet laden.',
	hideWhenEmpty,
	className,
	children,
	ref,
}: PanelProps & { ref?: Ref<HTMLElement> }) => {
	if (!error && isEmpty && hideWhenEmpty) return null;

	return (
		<article ref={ref} className={classNames('panel', className)}>
			<header className="panel-head">
				<Title element="h3" size={6} value={title} />
				{action && <span className="panel-action">{action}</span>}
				{href && <Button variant="ghost" icon="arrow-right" iconStyle="badge" url={href} aria-label={linkLabel ?? title} className="panel-link" />}
			</header>
			<div className="panel-body">
				{error ? <p className="panel-error">{errorLabel}</p> : isEmpty ? <p className="panel-empty">{emptyLabel}</p> : children}
			</div>
		</article>
	);
};

export default Panel;
