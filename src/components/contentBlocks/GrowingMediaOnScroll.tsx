import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import type { GrowingMediaOnScrollProps } from '@/lib/content';

// A media panel that grows to full-bleed while scrolling. The section carries a named
// view-timeline; the sticky stage's frame animates its scale/radius along it — pure CSS,
// no JavaScript (see GrowingMediaOnScroll.scss).
const GrowingMediaOnScroll = ({ heading, media, caption, colorset, ref }: GrowingMediaOnScrollProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="growing-media-on-scroll">
			{heading && (
				<Container>
					<HeadingGroup
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
						element="header"
						className="growing-media-on-scroll-header"
					/>
				</Container>
			)}

			<div className="growing-media-on-scroll-scene">
				<div className="growing-media-on-scroll-stage">
					<div className="growing-media-on-scroll-frame-wrap">
						<Media {...media} className="growing-media-on-scroll-stage-media" />
					</div>
				</div>
			</div>

			{caption && (
				<Container>
					<Content element="p" size="small" className="growing-media-on-scroll-stage-caption" value={caption} />
				</Container>
			)}
		</Section>
	);
};

export default GrowingMediaOnScroll;
