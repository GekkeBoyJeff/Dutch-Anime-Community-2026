import type { Ref } from 'react';

import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import { classNames } from '@/lib/classNames';
import type { AvatarProps } from '@/lib/content/schema/basics/avatar';

// Circular avatar built on Media (square frame, rounded full) with an optional presence dot and an
// initials fallback when there is no image.
const Avatar = ({
	src,
	alt = '',
	size = 'm',
	status,
	initials,
	className,
	ref,
}: AvatarProps & { ref?: Ref<HTMLSpanElement> }) => {
	return (
		<span ref={ref} className={classNames('avatar', `is-${size}`, className)}>
			{src ? (
				<Media type="image" src={src} alt={alt} ratio="1" className="avatar-image" />
			) : (
				<Content element="span" className="avatar-fallback" value={initials} />
			)}
			{status && <span className={classNames('avatar-status', `is-${status}`)} aria-hidden="true" />}
		</span>
	);
};

export default Avatar;
