import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import Media from '@/components/basics/Media/Media';
import Section from '@/components/basics/Section/Section';
import HeadingGroup from '@/components/components/HeadingGroup/HeadingGroup';

import type { GrowingMediaOnScrollProps as GrowingMediaOnScrollSchemaProps } from './GrowingMediaOnScroll.schema';

import './GrowingMediaOnScroll.scss';

type GrowingMediaOnScrollProps = GrowingMediaOnScrollSchemaProps;

const GrowingMediaOnScroll = ({
	heading,
	media,
	caption,
	colorset,
}: GrowingMediaOnScrollProps) => {
	return (
		<Section colorset={colorset} className="growing-media-on-scroll">
			{heading && (
				<Container>
					<HeadingGroup {...heading} element="header" className="growing-media-on-scroll-header" />
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
