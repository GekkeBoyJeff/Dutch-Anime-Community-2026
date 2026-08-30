import { classNames } from '@/lib/shared/classNames';
import type { IndicatorProps as IndicatorSchemaProps } from '@/lib/site/content/schema/basics/indicator';

type IndicatorProps = IndicatorSchemaProps;

const Indicator = ({
	count,
	position = 'top-end',
	variant = 'primary',
	showZero = false,
	className,
}: IndicatorProps) => {
	const hidden = count === 0 && !showZero;

	return (
		<span className={classNames('indicator-badge', `is-${position}`, `is-${variant}`, className)}>
			{!hidden && (
				<span className={classNames('indicator-mark', count !== undefined && 'has-count')} aria-hidden="true">
					{count !== undefined && count}
				</span>
			)}
		</span>
	);
};

export default Indicator;
