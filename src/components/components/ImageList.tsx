import type { CSSProperties, Ref } from 'react';

import Media from '@/components/basics/Media';
import { classNames } from '@/lib/classNames';
import type { ImageListProps as ImageListSchemaProps } from '@/lib/content/schema/components/imageList';

type ImageListProps = ImageListSchemaProps;

// Grid/featured/masonry/mosaic arrangement of Media items — the simpler sibling of Gallery, with no
// captions or links. Shared `mediaOptions` are spread first, then each item's own props override
// them, so a gallery can set one ratio centrally. Fully server-rendered; the column count feeds a
// --columns custom property the SCSS reads.
const ImageList = ({ items = [], mediaOptions, layout = 'grid', columns = 3, className, ref }: ImageListProps & { ref?: Ref<HTMLDivElement> }) => {
	if (items.length === 0) {
		return null;
	}

	const style = { '--columns': columns } as CSSProperties;

	return (
		<div ref={ref} className={classNames('image-list', `is-${layout}`, className)} style={style}>
			{items.map((item, index) => (
				<Media key={index} {...mediaOptions} {...item} className="item" />
			))}
		</div>
	);
};

export default ImageList;
