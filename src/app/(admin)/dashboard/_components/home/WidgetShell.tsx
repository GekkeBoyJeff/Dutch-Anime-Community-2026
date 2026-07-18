import type { ReactNode } from 'react';

import Button from '@/components/basics/Button';
import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';

interface WidgetShellProps {
	title: string;
	/** Deep link into the owning section (rendered as a trailing arrow in the header) */
	href?: string;
	linkLabel?: string;
	loading: boolean;
	error: string | null;
	/** The query resolved with nothing actionable */
	isEmpty?: boolean;
	/** Shown when empty and the widget stays visible (personal "what's next" anchors) */
	emptyLabel?: string;
	/** Drop the whole card when it resolves empty — used by org widgets to avoid clutter */
	hideWhenEmpty?: boolean;
	children?: ReactNode;
}

// The shared card frame for a home widget: a titled surface with an optional deep link and the three
// async states (skeleton · quiet inline error · empty). Route-local composition — it wires existing
// primitives (Title/Skeleton/Button), so it is not a tier component and needs no story.
const WidgetShell = ({ title, href, linkLabel, loading, error, isEmpty, emptyLabel, hideWhenEmpty, children }: WidgetShellProps) => {
	if (!loading && !error && isEmpty && hideWhenEmpty) return null;

	return (
		<article className="widget">
			<header className="widget-head">
				<Title element="h3" size={6} value={title} />
				{href && <Button variant="ghost" icon="arrow-right" iconStyle="badge" url={href} aria-label={linkLabel ?? title} className="widget-link" />}
			</header>
			<div className="widget-body">
				{loading ? (
					<div className="widget-skeleton" aria-hidden="true">
						<Skeleton height="1rem" />
						<Skeleton height="1rem" width="70%" />
					</div>
				) : error ? (
					<p className="widget-error">Kon niet laden.</p>
				) : isEmpty ? (
					<p className="widget-empty">{emptyLabel ?? 'Niets te tonen'}</p>
				) : (
					children
				)}
			</div>
		</article>
	);
};

export default WidgetShell;
