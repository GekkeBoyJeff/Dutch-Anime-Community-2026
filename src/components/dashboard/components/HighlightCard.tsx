import NextLink from 'next/link';
import type { ReactNode } from 'react';

import Icon from '@/components/basics/Icon';
import Skeleton from '@/components/basics/Skeleton';

export interface HighlightCardProps {
	eyebrow: string;
	href: string;
	ctaLabel: string;
	loading: boolean;
	isEmpty: boolean;
	emptyLabel: string;
	/** The bold headline fact; pairs with `sub`. Omit and use `children` for custom content instead */
	lead?: ReactNode;
	/** Secondary line under `lead` */
	sub?: ReactNode;
	children?: ReactNode;
}

// The mega-menu's per-group highlight (right zone): eyebrow, a fixed-height body (skeleton · empty ·
// lead) so nothing shifts, and a circle-arrow CTA pinned to the bottom. Presentational — the caller
// runs the query and passes either `lead`/`sub` or custom `children`.
const HighlightCard = ({ eyebrow, href, ctaLabel, loading, isEmpty, emptyLabel, lead, sub, children }: HighlightCardProps) => (
	<div className="highlight-card">
		<span className="eyebrow">{eyebrow}</span>
		<div className="body">
			{loading ? (
				<>
					<Skeleton height="1.4rem" width="80%" />
					<Skeleton height="1rem" width="55%" />
				</>
			) : isEmpty ? (
				<p className="empty">{emptyLabel}</p>
			) : lead ? (
				<>
					<span className="lead">{lead}</span>
					{sub && <span className="sub">{sub}</span>}
				</>
			) : (
				children
			)}
		</div>
		<NextLink href={href} className="cta">
			<span>{ctaLabel}</span>
			<span className="circle" aria-hidden="true">
				<Icon name="arrow-up-right" />
			</span>
		</NextLink>
	</div>
);

export default HighlightCard;
