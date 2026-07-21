import type { ReactNode, Ref } from 'react';

import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/classNames';

export interface MetricDelta {
	/** The change, pre-formatted (e.g. "+12%", "−3") */
	label: string;
	direction: 'up' | 'down' | 'flat';
}

export interface MetricProps {
	/** Short caption above the value */
	label: string;
	/** The headline figure, already formatted */
	value: ReactNode;
	/** Rendered small after the value (a currency, a unit) */
	unit?: string;
	/** Period-over-period change, shown as a chip beside the value */
	delta?: MetricDelta;
	/** Points for the sparkline, oldest first. Fewer than two points renders nothing. */
	trend?: number[];
	// Deliberately narrower than the shared Tone: a figure is above or below zero, never "warning".
	// Urgency about a number belongs on the Entry or Moment that carries it.
	/** Tints the value for signed figures */
	tone?: 'neutral' | 'positive' | 'negative';
	loading?: boolean;
	className?: string;
}

const DELTA_ARROW: Record<MetricDelta['direction'], string> = { up: '▲', down: '▼', flat: '→' };

const SPARK_WIDTH = 96;
const SPARK_HEIGHT = 28;

// Maps the series onto the viewBox with a half-stroke inset top and bottom, so the extremes are not
// clipped. A flat series (min === max) draws through the middle instead of dividing by zero.
const sparkPath = (points: number[]): string => {
	const min = Math.min(...points);
	const max = Math.max(...points);
	const span = max - min;
	const inset = 2;
	const usable = SPARK_HEIGHT - inset * 2;

	return points
		.map((point, index) => {
			const x = (index / (points.length - 1)) * SPARK_WIDTH;
			const y = span === 0 ? SPARK_HEIGHT / 2 : inset + usable - ((point - min) / span) * usable;
			return `${index === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`;
		})
		.join(' ');
};

// A number that matters: caption, a large tabular figure with an optional delta chip, and an optional
// sparkline that puts the figure in motion. The sparkline is a hand-rolled <path> rather than a chart
// library — at this size axes and tooltips are noise, and it keeps the component server-rendered.
const Metric = ({ label, value, unit, delta, trend, tone = 'neutral', loading = false, className, ref }: MetricProps & { ref?: Ref<HTMLDivElement> }) => {
	const hasTrend = Array.isArray(trend) && trend.length > 1;

	return (
		<div ref={ref} className={classNames('metric', `is-${tone}`, className)}>
			<span className="metric-label">{label}</span>
			<div className="metric-figure">
				{loading ? (
					<Skeleton height="1.75rem" width="55%" />
				) : (
					<span className="metric-value">
						{value}
						{unit && <span className="metric-unit">{unit}</span>}
					</span>
				)}
				{!loading && delta && (
					<span className={classNames('metric-delta', `is-${delta.direction}`)}>
						<span className="metric-delta-arrow" aria-hidden="true">
							{DELTA_ARROW[delta.direction]}
						</span>
						{delta.label}
					</span>
				)}
			</div>
			{hasTrend && !loading && (
				<svg className="metric-spark" viewBox={`0 0 ${SPARK_WIDTH} ${SPARK_HEIGHT}`} preserveAspectRatio="none" role="presentation" focusable="false">
					<path d={sparkPath(trend)} />
				</svg>
			)}
		</div>
	);
};

export default Metric;
