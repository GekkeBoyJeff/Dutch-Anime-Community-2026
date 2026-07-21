import type { Ref } from 'react';

import Icon from '@/components/basics/Icon';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/classNames';

import type { Tone } from './tone';

export interface MeterProps {
	label: string;
	value: number;
	max: number;
	/** 'bar' reads well in a list; 'ring' when the meter is the card's subject */
	shape?: 'bar' | 'ring';
	tone?: Tone;
	/** Overrides the default `${value}/${max}` readout */
	valueLabel?: string;
	/** Shown with a gold seal once value reaches max */
	completeLabel?: string;
	loading?: boolean;
	className?: string;
}

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

// Progress towards a whole. A bare "6 of 10" is a number you have to interpret; a filled shape is
// something you read at a glance. Reaching max is treated as an event, not just 100% — the seal is
// the payoff for finishing a packing list.
const Meter = ({ label, value, max, shape = 'bar', tone = 'neutral', valueLabel, completeLabel, loading = false, className, ref }: MeterProps & { ref?: Ref<HTMLDivElement> }) => {
	const safeMax = max > 0 ? max : 1;
	const clamped = Math.max(0, Math.min(value, safeMax));
	const fraction = clamped / safeMax;
	const complete = value >= max && max > 0;
	const readout = valueLabel ?? `${value}/${max}`;

	return (
		<div
			ref={ref}
			className={classNames('meter', `is-${shape}`, `is-${tone}`, complete && 'is-complete', className)}
			role="progressbar"
			aria-label={label}
			aria-valuemin={0}
			aria-valuemax={max}
			aria-valuenow={loading ? undefined : clamped}
		>
			<span className="meter-label">{label}</span>

			{loading ? (
				<Skeleton height={shape === 'ring' ? '4rem' : '0.5rem'} radius="full" />
			) : shape === 'ring' ? (
				<svg className="meter-ring" viewBox="0 0 64 64" role="presentation" focusable="false">
					<circle className="meter-ring-track" cx="32" cy="32" r={RING_RADIUS} />
					<circle
						className="meter-ring-fill"
						cx="32"
						cy="32"
						r={RING_RADIUS}
						strokeDasharray={RING_CIRCUMFERENCE}
						strokeDashoffset={RING_CIRCUMFERENCE * (1 - fraction)}
					/>
				</svg>
			) : (
				<span className="meter-track">
					<span className="meter-fill" style={{ inlineSize: `${fraction * 100}%` }} />
				</span>
			)}

			{!loading && (
				<span className="meter-readout">
					{complete && completeLabel ? (
						<>
							<Icon name="check" className="meter-seal" />
							{completeLabel}
						</>
					) : (
						readout
					)}
				</span>
			)}
		</div>
	);
};

export default Meter;
