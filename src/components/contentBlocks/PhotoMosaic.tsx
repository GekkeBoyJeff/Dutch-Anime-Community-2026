import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import { classNames } from '@/lib/classNames';
import type { PhotoMosaicProps } from '@/lib/content';

// A community photo wall. `clean` = tight rounded grid with hover zoom and a caption overlay;
// `scrapbook` = polaroid frames with slight rotations that straighten on hover.
const PhotoMosaic = ({ heading, variant = 'clean', items = [], colorset, ref }: PhotoMosaicProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className={classNames('photo-mosaic', `is-${variant}`)}>
			<Container>
				{heading && (
					<HeadingGroup
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
						element="header"
						className="header"
					/>
				)}

				<ul className="grid">
					{items.map((item) => {
						return (
							<li key={item.id} className={classNames('mosaic-item', item.span && item.span !== 'standard' && `is-${item.span}`)}>
								<figure className="frame">
									{/* Polaroids keep a fixed photo ratio via Media's own prop; the clean grid
									lets the photo fill its grid cell instead (see the SCSS override). */}
									<Media
										{...item.media}
										ratio={variant === 'scrapbook' ? (item.media.ratio ?? '4 / 3') : item.media.ratio}
										className="photo"
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
