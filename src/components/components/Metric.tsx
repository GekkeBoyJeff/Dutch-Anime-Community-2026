import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/shared/classNames';
import type { MetricDelta, MetricProps as MetricSchemaProps } from '@/lib/site/content/schema/components/metric';

type MetricProps = MetricSchemaProps;

const DELTA_ARROW: Record<MetricDelta['direction'], string> = { up: '▲', down: '▼', flat: '→' };

const SPARK_WIDTH = 96;
const SPARK_HEIGHT = 28;

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

const Metric = ({
	label,
	value,
	unit,
	delta,
	trend,
	tone = 'neutral',
	loading = false,
	className,
}: MetricProps) => {
	const hasTrend = Array.isArray(trend) && trend.length > 1;

	return (
		<div className={classNames('metric', `is-${tone}`, className)}>
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
