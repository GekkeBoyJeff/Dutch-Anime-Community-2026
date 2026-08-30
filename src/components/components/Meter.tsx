import Icon from '@/components/basics/Icon';
import Skeleton from '@/components/basics/Skeleton';
import { classNames } from '@/lib/shared/classNames';
import type { MeterProps as MeterSchemaProps } from '@/lib/site/content/schema/components/meter';

type MeterProps = MeterSchemaProps;

const RING_RADIUS = 26;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;

const Meter = ({
	label,
	value,
	max,
	shape = 'bar',
	tone = 'neutral',
	valueLabel,
	completeLabel,
	loading = false,
	className,
}: MeterProps) => {
	const safeMax = max > 0 ? max : 1;
	const clamped = Math.max(0, Math.min(value, safeMax));
	const fraction = clamped / safeMax;
	const complete = value >= max && max > 0;
	const readout = valueLabel ?? `${value}/${max}`;

	return (
		<div
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
