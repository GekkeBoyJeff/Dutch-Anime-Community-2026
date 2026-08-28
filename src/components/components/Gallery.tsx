import type { CSSProperties } from 'react';

import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import { classNames } from '@/lib/shared/classNames';
import type { GalleryProps as GallerySchemaProps } from '@/lib/site/content/schema/components/gallery';

type GalleryProps = GallerySchemaProps;

const Gallery = ({
	items = [],
	variant = 'grid',
	columns = 3,
	gap = 'm',
	className,
}: GalleryProps) => {
	if (items.length === 0) {
		return null;
	}

	const style = { '--columns': columns } as CSSProperties;

	return (
		<div className={classNames('gallery', `is-${variant}`, `has-gap-${gap}`, className)} style={style}>
			{items.map((item, index) => {
				const figure = (
					<figure className="gallery-item">
						<div className="gallery-frame" style={item.ratio ? { aspectRatio: item.ratio } : undefined}>
							<Media type="image" src={item.src} alt={item.alt} />
						</div>

						{(item.caption || item.credit) && (
							<figcaption className="caption">
								{item.caption && <Content element="span" value={item.caption} />}
								{item.credit && <Content element="span" className="gallery-credit" value={item.credit} />}
							</figcaption>
						)}
					</figure>
				);

				return item.href ? (
					<Interactive key={index} url={item.href} className="gallery-link">
						{figure}
					</Interactive>
				) : (
					<div key={index} className="gallery-cell">
						{figure}
					</div>
				);
			})}
		</div>
	);
};

export default Gallery;
