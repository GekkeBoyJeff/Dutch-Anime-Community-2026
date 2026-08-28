import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import type { GrowingMediaOnScrollProps as GrowingMediaOnScrollSchemaProps } from '@/lib/site/content/schema/blocks/growingMediaOnScroll';

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
