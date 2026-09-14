import Icon from '@/components/basics/Icon/Icon';
import { classNames } from '@/lib/shared/classNames';

import type { RatingProps as RatingSchemaProps } from './Rating.schema';

import './Rating.scss';

type RatingProps = RatingSchemaProps;

const Rating = ({
	value,
	max = 5,
	ariaLabel,
	className,
}: RatingProps) => {
	const clamped = Math.min(Math.max(value, 0), max);
	const rounded = Math.floor(clamped) + (clamped % 1 ? 0.5 : 0);

	return (
		<span role="img" aria-label={ariaLabel ?? `${value}/${max}`} className={classNames('rating', className)}>
			{Array.from({ length: max }, (_, index) => (
				<span key={index} className="rating-star">
					<Icon name="star" />
					{rounded > index && (
						<span className={classNames('rating-fill', rounded === index + 0.5 && 'is-half')}>
							<Icon name="star" />
						</span>
					)}
				</span>
			))}
		</span>
	);
};

export default Rating;
