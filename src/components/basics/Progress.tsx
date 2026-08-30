import { classNames } from '@/lib/shared/classNames';
import type { ProgressProps as ProgressSchemaProps } from '@/lib/site/content/schema/basics/progress';

type ProgressProps = ProgressSchemaProps;

const Progress = ({
	value,
	max = 100,
	ariaLabel,
	className,
}: ProgressProps) => {
	const indeterminate = value === undefined;
	const percent = indeterminate ? undefined : Math.max(0, Math.min(100, (value / max) * 100));

	return (
		<div
			role="progressbar"
			aria-label={ariaLabel}
			aria-valuemin={indeterminate ? undefined : 0}
			aria-valuemax={indeterminate ? undefined : max}
			aria-valuenow={indeterminate ? undefined : value}
			className={classNames('progress', indeterminate && 'is-indeterminate', className)}
		>
			<span className="progress-bar" style={percent === undefined ? undefined : { inlineSize: `${percent}%` }} />
		</div>
	);
};

export default Progress;
