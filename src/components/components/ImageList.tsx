import type { CSSProperties } from 'react';

import Media from '@/components/basics/Media';
import { classNames } from '@/lib/shared/classNames';
import type { ImageListProps as ImageListSchemaProps } from '@/lib/site/content/schema/components/imageList';

type ImageListProps = ImageListSchemaProps;

const ImageList = ({
	items = [],
	mediaOptions,
	layout = 'grid',
	columns = 3,
	className,
}: ImageListProps) => {
	if (items.length === 0) {
		return null;
	}

	const style = { '--columns': columns } as CSSProperties;

	return (
		<div className={classNames('image-list', `is-${layout}`, className)} style={style}>
			{items.map((item, index) => (
				<Media key={index} {...mediaOptions} {...item} className="image-list-item" />
			))}
		</div>
	);
};

export default ImageList;
