import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import Media from '@/components/basics/Media/Media';
import Section from '@/components/basics/Section/Section';
import Title from '@/components/basics/Title/Title';
import { classNames } from '@/lib/shared/classNames';

import type { TextMediaProps as TextMediaSchemaProps } from './TextMedia.schema';

import './TextMedia.scss';

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
