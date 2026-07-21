'use client';

import type { ReactNode } from 'react';
import {
	Area,
	AreaChart,
	Bar,
	BarChart,
	CartesianGrid,
	Cell,
	Line,
	LineChart,
	Pie,
	PieChart,
	ResponsiveContainer,
	Tooltip,
	XAxis,
	YAxis,
} from 'recharts';

import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';
import useReducedMotion from '@/hooks/useReducedMotion';
import { classNames } from '@/lib/classNames';

// Categorical palette as custom properties. recharts paints SVG attributes, so a var() reference
// resolves against the element's own properties — the ramp stays defined in one place, and series 1
// follows the accent instead of duplicating its hex.
export const CHART_PALETTE = [
	'var(--admin-chart-1)',
	'var(--admin-chart-2)',
	'var(--admin-chart-3)',
	'var(--admin-chart-4)',
	'var(--admin-chart-5)',
	'var(--admin-chart-6)',
];
const GRID = 'var(--admin-chart-grid)';
const AXIS = 'var(--admin-chart-axis)';
const DEFAULT_HEIGHT = 260;

export interface ChartSeries {
	/** Key into each datum for this series' numeric value */
	key: string;
	/** Legend/tooltip name */
	name: string;
	/** Overrides the palette colour for this series */
	color?: string;
}

type Datum = Record<string, string | number | null>;

interface FrameProps {
	title?: string;
	/** Reserved canvas height in px — fixed so the card never shifts on load */
	height?: number;
	loading?: boolean;
	/** Shown when there is nothing to plot */
	empty?: boolean;
	emptyLabel?: string;
	/** A next-step CTA rendered under the empty label (a link/button); omit for a plain message. */
	emptyAction?: ReactNode;
	/** Trailing header slot (legend, a control) */
	action?: ReactNode;
	className?: string;
	children: ReactNode;
}

// The shared chart card: title + optional action, and a fixed-height canvas that reserves its box up
// front (zero CLS) and swaps between a skeleton, an empty state and the plot. The empty state pairs a
// warm line with an optional next-step action, so a zero-data card reads as an invitation, not a hole.
const ChartFrame = ({ title, height = DEFAULT_HEIGHT, loading, empty, emptyLabel = 'Geen gegevens', emptyAction, action, className, children }: FrameProps) => {
	return (
		<section className={classNames('chart', className)}>
			{(title || action) && (
				<header className="chart-head">
					{title && (
						<Title element="h3" size={5}>
							{title}
						</Title>
					)}
					{action && <div className="chart-action">{action}</div>}
				</header>
			)}
			<div className="chart-canvas" style={{ blockSize: `${height}px` }}>
				{loading ? (
					<Skeleton width="100%" height="100%" radius="m" />
				) : empty ? (
					<div className="chart-empty">
						<p className="chart-empty-line">{emptyLabel}</p>
						{emptyAction && <div className="chart-empty-action">{emptyAction}</div>}
					</div>
				) : (
					children
				)}
			</div>
		</section>
	);
};

interface TooltipEntry {
	name?: string;
	value?: number | string;
	color?: string;
	payload?: Datum;
}

interface ChartTooltipProps {
	active?: boolean;
	payload?: TooltipEntry[];
	label?: string | number;
	valueFormatter: (value: number) => string;
}

// Popover-style tooltip on the admin tokens; recharts injects active/payload/label, the caller passes
// valueFormatter. Declared at module scope so recharts only ever clones the element, never re-creates it.
const ChartTooltip = ({ active, payload, label, valueFormatter }: ChartTooltipProps) => {
	if (!active || !payload?.length) return null;
	return (
		<div className="chart-tooltip">
			{label !== undefined && <span className="chart-tooltip-label">{label}</span>}
			<ul className="chart-tooltip-rows">
				{payload.map((entry, index) => (
					<li key={index} className="chart-tooltip-row">
						<span className="chart-tooltip-swatch" style={{ backgroundColor: entry.color }} aria-hidden="true" />
						<span className="chart-tooltip-name">{entry.name}</span>
						<span className="chart-tooltip-value">{typeof entry.value === 'number' ? valueFormatter(entry.value) : entry.value}</span>
					</li>
				))}
			</ul>
		</div>
	);
};

const AXIS_TICK = { fill: AXIS, fontSize: 12 };
const identity = (value: number) => String(value);

interface CartesianProps {
	data: Datum[];
	series: ChartSeries[];
	/** Key into each datum for the category/time axis label. Defaults to 'label' */
	xKey?: string;
	formatValue?: (value: number) => string;
	title?: string;
	height?: number;
	loading?: boolean;
	action?: ReactNode;
	emptyLabel?: string;
	emptyAction?: ReactNode;
	className?: string;
}

// Line / area chart: one or more series over a shared X axis. `variant='area'` fills under the line
// with a gold-fading gradient — the pick for a value-over-time trend.
const ChartLine = ({ data, series, xKey = 'label', formatValue = identity, variant = 'line', title, height, loading, action, emptyLabel, emptyAction, className }: CartesianProps & { variant?: 'line' | 'area' }) => {
	const reduced = useReducedMotion();
	const empty = data.length === 0;
	const color = (index: number, s: ChartSeries) => s.color ?? CHART_PALETTE[index % CHART_PALETTE.length];

	return (
		<ChartFrame title={title} height={height} loading={loading} empty={empty} emptyLabel={emptyLabel} emptyAction={emptyAction} action={action} className={className}>
			<ResponsiveContainer width="100%" height="100%">
				{variant === 'area' ? (
					<AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
						<defs>
							{series.map((s, index) => (
								<linearGradient key={s.key} id={`chart-fill-${s.key}`} x1="0" y1="0" x2="0" y2="1">
									<stop offset="0%" stopColor={color(index, s)} stopOpacity={0.24} />
									<stop offset="100%" stopColor={color(index, s)} stopOpacity={0.02} />
								</linearGradient>
							))}
						</defs>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis dataKey={xKey} tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID }} />
						<YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={56} tickFormatter={formatValue} />
						<Tooltip content={<ChartTooltip valueFormatter={formatValue} />} cursor={{ stroke: GRID }} />
						{series.map((s, index) => (
							<Area key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={color(index, s)} strokeWidth={2} fill={`url(#chart-fill-${s.key})`} isAnimationActive={!reduced} dot={false} activeDot={{ r: 4 }} />
						))}
					</AreaChart>
				) : (
					<LineChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis dataKey={xKey} tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID }} />
						<YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={56} tickFormatter={formatValue} />
						<Tooltip content={<ChartTooltip valueFormatter={formatValue} />} cursor={{ stroke: GRID }} />
						{series.map((s, index) => (
							<Line key={s.key} type="monotone" dataKey={s.key} name={s.name} stroke={color(index, s)} strokeWidth={2} isAnimationActive={!reduced} dot={false} activeDot={{ r: 4 }} />
						))}
					</LineChart>
				)}
			</ResponsiveContainer>
		</ChartFrame>
	);
};

// Vertical bar chart across categories. One series reads as a ranked breakdown; multiple series group
// side by side.
const ChartBar = ({ data, series, xKey = 'label', formatValue = identity, title, height, loading, action, emptyLabel, emptyAction, className }: CartesianProps) => {
	const reduced = useReducedMotion();
	const empty = data.length === 0;
	const color = (index: number, s: ChartSeries) => s.color ?? CHART_PALETTE[index % CHART_PALETTE.length];

	return (
		<ChartFrame title={title} height={height} loading={loading} empty={empty} emptyLabel={emptyLabel} emptyAction={emptyAction} action={action} className={className}>
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
					<CartesianGrid stroke={GRID} vertical={false} />
					<XAxis dataKey={xKey} tick={AXIS_TICK} tickLine={false} axisLine={{ stroke: GRID }} />
					<YAxis tick={AXIS_TICK} tickLine={false} axisLine={false} width={56} tickFormatter={formatValue} />
					<Tooltip content={<ChartTooltip valueFormatter={formatValue} />} cursor={{ fill: 'var(--surface-faint)' }} />
					{series.map((s, index) => (
						<Bar key={s.key} dataKey={s.key} name={s.name} fill={color(index, s)} radius={[4, 4, 0, 0]} maxBarSize={48} isAnimationActive={!reduced} />
					))}
				</BarChart>
			</ResponsiveContainer>
		</ChartFrame>
	);
};

export interface DonutSlice {
	label: string;
	value: number;
	color?: string;
}

interface DonutProps {
	data: DonutSlice[];
	formatValue?: (value: number) => string;
	title?: string;
	height?: number;
	loading?: boolean;
	/** Big number in the ring centre */
	centerLabel?: string;
	centerCaption?: string;
	emptyLabel?: string;
	className?: string;
}

// Donut: category share with a legend and an optional centre total.
const ChartDonut = ({ data, formatValue = identity, title, height, loading, centerLabel, centerCaption, emptyLabel, className }: DonutProps) => {
	const reduced = useReducedMotion();
	const empty = data.length === 0 || data.every((slice) => slice.value === 0);

	return (
		<ChartFrame title={title} height={height} loading={loading} empty={empty} emptyLabel={emptyLabel} className={classNames('is-donut', className)}>
			<div className="chart-donut">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Tooltip content={<ChartTooltip valueFormatter={formatValue} />} />
						<Pie data={data} dataKey="value" nameKey="label" cx="50%" cy="50%" innerRadius="62%" outerRadius="86%" paddingAngle={2} stroke="none" isAnimationActive={!reduced}>
							{data.map((slice, index) => (
								<Cell key={slice.label} fill={slice.color ?? CHART_PALETTE[index % CHART_PALETTE.length]} />
							))}
						</Pie>
					</PieChart>
				</ResponsiveContainer>
				{(centerLabel || centerCaption) && (
					<div className="chart-donut-center" aria-hidden="true">
						{centerLabel && <span className="chart-donut-value">{centerLabel}</span>}
						{centerCaption && <span className="chart-donut-caption">{centerCaption}</span>}
					</div>
				)}
			</div>
			<ul className="chart-legend">
				{data.map((slice, index) => (
					<li key={slice.label} className="chart-legend-item">
						<span className="chart-legend-swatch" style={{ backgroundColor: slice.color ?? CHART_PALETTE[index % CHART_PALETTE.length] }} aria-hidden="true" />
						<span className="chart-legend-name">{slice.label}</span>
						<span className="chart-legend-value">{formatValue(slice.value)}</span>
					</li>
				))}
			</ul>
		</ChartFrame>
	);
};

// One chart family, one recharts wrap: Chart.Line (line/area), Chart.Bar, Chart.Donut. All share the
// ChartFrame (fixed height, loading/empty states, popover-style tooltip) and the token palette.
const Chart = {
	Line: ChartLine,
	Bar: ChartBar,
	Donut: ChartDonut,
};

export default Chart;
