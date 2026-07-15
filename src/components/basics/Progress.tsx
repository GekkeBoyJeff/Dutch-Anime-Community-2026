import type { Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { ProgressProps } from '@/lib/content/schema/basics/progress';

// Linear progress bar with role="progressbar". With a `value` it is determinate (fills to value/max);
// without one it is indeterminate (a sliding sweep, gated by prefers-reduced-motion).
const Progress = ({
	value,
	max = 100,
	label,
	size = 'm',
	className,
	ref,
}: ProgressProps & { ref?: Ref<HTMLDivElement> }) => {
	const indeterminate = value === undefined;
	const percent = indeterminate ? undefined : Math.max(0, Math.min(100, (value / max) * 100));

	return (
		<div
			ref={ref}
			role="progressbar"
			aria-label={label}
			aria-valuemin={indeterminate ? undefined : 0}
			aria-valuemax={indeterminate ? undefined : max}
			aria-valuenow={indeterminate ? undefined : value}
			className={classNames('progress', `is-${size}`, indeterminate && 'is-indeterminate', className)}
		>
			<span className="bar" style={percent === undefined ? undefined : { inlineSize: `${percent}%` }} />
		</div>
	);
};

export default Progress;
