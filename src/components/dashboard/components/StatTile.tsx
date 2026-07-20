import type { ReactNode, Ref } from 'react';

import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/classNames';

export interface StatTileDelta {
	/** The change, pre-formatted (e.g. "+12%", "−3") */
	label: string;
	/** Direction of the change — tints the chip and picks the arrow */
	direction: 'up' | 'down' | 'flat';
}

export interface StatTileProps {
	/** Short caption above the value */
	label: string;
	/** The headline figure (a formatted amount, count or date) */
	value: ReactNode;
	/** Optional sub-line beneath the value (context, a running total, a hint) */
	note?: ReactNode;
	/** Optional trend chip beside the value (a period-over-period delta) */
	delta?: StatTileDelta;
	/** Tints the value for signed figures — a saldo, a delta */
	tone?: 'default' | 'positive' | 'negative';
	/** Reserve the box and show a value placeholder while the figure loads (zero-CLS) */
	loading?: boolean;
	className?: string;
	ref?: Ref<HTMLDivElement>;
}

const DELTA_ARROW: Record<StatTileDelta['direction'], string> = { up: '▲', down: '▼', flat: '→' };

// A dashboard KPI tile: caption, a large tabular figure with an optional trend chip and a sub-line, on
// a layered work-surface sized to a fixed height so a loading→loaded swap never shifts the row. Shared
// across admin overview pages (finance totals, event stats); lay several out inside a `.stat-tile-row`.
const StatTile = ({ label, value, note, delta, tone = 'default', loading = false, className, ref }: StatTileProps) => (
	<div ref={ref} className={classNames('stat-tile', tone !== 'default' && `is-${tone}`, className)}>
		<span className="stat-tile-label">{label}</span>
		<div className="stat-tile-figure">
			{loading ? (
				<Skeleton className="stat-tile-skeleton" width="60%" height="1.75rem" />
			) : (
				<span className="stat-tile-value">{value}</span>
			)}
			{!loading && delta && (
				<span className={classNames('stat-tile-delta', `is-${delta.direction}`)}>
					<span className="stat-tile-delta-arrow" aria-hidden="true">
						{DELTA_ARROW[delta.direction]}
					</span>
					{delta.label}
				</span>
			)}
		</div>
		<span className="stat-tile-note">{loading ? null : note}</span>
	</div>
);

export default StatTile;
