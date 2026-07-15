import type { CSSProperties, Ref } from 'react';

import Content from '@/components/basics/Content';
import Interactive from '@/components/basics/Interactive';
import Media from '@/components/basics/Media';
import { classNames } from '@/lib/classNames';
import type { GalleryProps as GallerySchemaProps } from '@/lib/content/schema/components/gallery';

type GalleryProps = GallerySchemaProps;

// Image gallery in masonry/grid/strip layouts. Fully server-rendered: each item is a <figure> built
// from the Media primitive, optionally wrapped in Interactive when it links somewhere. The column
// count drives a --columns custom property the SCSS reads for grid and masonry.
const Gallery = ({ items = [], variant = 'grid', columns = 3, gap = 'm', className, ref }: GalleryProps & { ref?: Ref<HTMLDivElement> }) => {
	if (items.length === 0) {
		return null;
	}

	const style = { '--columns': columns } as CSSProperties;

	return (
		<div ref={ref} className={classNames('gallery', `is-${variant}`, `has-gap-${gap}`, className)} style={style}>
			{items.map((item, index) => {
				const figure = (
					<figure className="item">
						<div className="frame" style={item.ratio ? { aspectRatio: item.ratio } : undefined}>
							<Media type="image" src={item.src} alt={item.alt} />
						</div>

						{(item.caption || item.credit) && (
							<figcaption className="caption">
								{item.caption && <Content element="span" value={item.caption} />}
								{item.credit && <Content element="span" className="credit" value={item.credit} />}
							</figcaption>
						)}
					</figure>
				);

				return item.url ? (
					<Interactive key={index} url={item.url} className="gallery-link">
						{figure}
					</Interactive>
				) : (
					<div key={index} className="cell">
						{figure}
					</div>
				);
			})}
		</div>
	);
};

export default Gallery;
