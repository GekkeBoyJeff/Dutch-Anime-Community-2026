import Container from '@/components/basics/Container/Container';
import HeadingGroup from '@/components/basics/HeadingGroup/HeadingGroup';
import Media from '@/components/basics/Media/Media';
import Section from '@/components/basics/Section/Section';
import { classNames } from '@/lib/shared/classNames';

import type { PhotoMosaicProps as PhotoMosaicSchemaProps } from './PhotoMosaic.schema';

import './PhotoMosaic.scss';

type PhotoMosaicProps = PhotoMosaicSchemaProps;

const PhotoMosaic = ({
	heading,
	variant = 'clean',
	items = [],
	colorset,
}: PhotoMosaicProps) => {
	return (
		<Section colorset={colorset} className={classNames('photo-mosaic', `is-${variant}`)}>
			<Container>
				{heading && <HeadingGroup {...heading} element="header" className="photo-mosaic-header" />}

				<ul className="photo-mosaic-grid">
					{items.map((item) => {
						return (
							<li key={item.id} className={classNames('photo-mosaic-item', item.span && item.span !== 'standard' && `is-${item.span}`)}>
								<figure className="photo-mosaic-frame">
									<Media
										{...item.media}
										ratio={variant === 'scrapbook' ? (item.media.ratio ?? '4 / 3') : item.media.ratio}
										className="photo-mosaic-photo"
									/>
									{item.caption && <figcaption className="caption">{item.caption}</figcaption>}
								</figure>
							</li>
						);
					})}
				</ul>
			</Container>
		</Section>
	);
};

export default PhotoMosaic;
