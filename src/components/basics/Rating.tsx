import type { Ref } from 'react';

import Icon from '@/components/basics/Icon';
import { classNames } from '@/lib/classNames';
import type { RatingProps } from '@/lib/content/schema/basics/rating';

// A star rating out of `max`: filled stars in the accent, the remainder as outlines. The value is
// announced as one label (`role="img"`); the star glyphs themselves stay decorative.
const Rating = ({ value, max = 5, label, className, ref }: RatingProps & { ref?: Ref<HTMLSpanElement> }) => {
	const filled = Math.round(Math.min(Math.max(value, 0), max));

	return (
		<span ref={ref} role="img" aria-label={label ?? `${value}/${max}`} className={classNames('rating', className)}>
			{Array.from({ length: max }, (_, index) => (
				<Icon key={index} name="star" className={index < filled ? 'is-filled' : undefined} />
			))}
		</span>
	);
};

export default Rating;
