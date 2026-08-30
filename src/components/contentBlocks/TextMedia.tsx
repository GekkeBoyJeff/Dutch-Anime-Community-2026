import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/shared/classNames';
import type { TextMediaProps as TextMediaSchemaProps } from '@/lib/site/content/schema/blocks/textMedia';

type TextMediaProps = TextMediaSchemaProps;

const TextMedia = ({
	title,
	value,
	media,
	reverse = false,
	colorset,
}: TextMediaProps) => {
	return (
		<Section colorset={colorset}>
			<Container className={classNames('text-media', reverse && 'is-reverse')}>
				<div className="text-media-body">
					{title && <Title size={2} value={title} />}
					{value && <Content value={value} />}
				</div>

				{media && <Media {...media} className="text-media-figure" />}
			</Container>
		</Section>
	);
};

export default TextMedia;
