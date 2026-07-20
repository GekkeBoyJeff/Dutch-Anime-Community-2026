import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';

export interface BarBreakdownRow {
	label: string;
	value: number;
}

interface BarBreakdownProps {
	title: string;
	rows: BarBreakdownRow[];
	emptyLabel: string;
	formatValue?: (value: number) => string;
	max?: number;
	loading?: boolean;
}

const SKELETON_WIDTHS = [82, 64, 48, 34, 22];

/**
 * Horizontal bar breakdown: labeled rows with a proportional track and a formatted value, widest bar =
 * the largest value (or `max` when the caller pins the scale). Domain-free — the consumer injects
 * `formatValue`; `loading` renders a tapering skeleton in place of the rows.
 */
const BarBreakdown = ({ title, rows, emptyLabel, formatValue, max, loading }: BarBreakdownProps) => {
	const scale = max ?? rows.reduce((m, r) => Math.max(m, r.value), 0);
	const format = formatValue ?? ((value: number) => String(value));

	return (
		<section className="bar-breakdown" aria-hidden={loading || undefined}>
			<Title element="h3" size={5}>{title}</Title>
			{loading ? (
				<ul className="bars">
					{SKELETON_WIDTHS.map((width) => (
						<li key={width} className="bar">
							<Skeleton width="70%" height="0.7rem" />
							<span className="track">
								<Skeleton width={`${width}%`} height="100%" radius="full" />
							</span>
							<Skeleton width="2.5rem" height="0.7rem" />
						</li>
					))}
				</ul>
			) : rows.length === 0 ? (
				<p className="empty">{emptyLabel}</p>
			) : (
				<ul className="bars">
					{rows.map((row) => (
						<li key={row.label} className="bar">
							<span className="label">{row.label}</span>
							<span className="track">
								<span className="fill" style={{ inlineSize: `${scale > 0 ? (row.value / scale) * 100 : 0}%` }} />
							</span>
							<span className="amount">{format(row.value)}</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

export default BarBreakdown;
