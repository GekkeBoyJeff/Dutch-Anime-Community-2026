import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/shared/classNames';
import type { RatingProps as RatingSchemaProps } from '@/lib/site/content/schema/basics/rating';

type RatingProps = RatingSchemaProps;

const Rating = ({
	value,
	max = 5,
	ariaLabel,
	className,
}: RatingProps) => {
	const filled = Math.round(Math.min(Math.max(value, 0), max));

	return (
		<span role="img" aria-label={ariaLabel ?? `${value}/${max}`} className={classNames('rating', className)}>
			{Array.from({ length: max }, (_, index) => (
				<Icon key={index} name="star" className={index < filled ? 'is-filled' : undefined} />
			))}
		</span>
	);
};

export default Rating;
