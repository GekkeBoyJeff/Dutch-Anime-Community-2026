import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import { classNames } from '@/lib/shared/classNames';
import type { AvatarProps as AvatarSchemaProps } from '@/lib/site/content/schema/basics/avatar';

type AvatarProps = AvatarSchemaProps;

const Avatar = ({
	src,
	alt = '',
	size = 'm',
	status,
	initials,
	className,
}: AvatarProps) => {
	return (
		<span className={classNames('avatar', `is-${size}`, className)}>
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
