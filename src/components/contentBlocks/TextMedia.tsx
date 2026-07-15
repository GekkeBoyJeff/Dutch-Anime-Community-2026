import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import { classNames } from '@/lib/classNames';
import type { TextMediaProps } from '@/lib/content';

// Text beside media in two columns (stacked on mobile). `reverse` swaps the order.
const TextMedia = ({
	title,
	text,
	media,
	reverse = false,
	colorset,
	ref,
}: TextMediaProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset}>
			<Container className={classNames('text-media', reverse && 'is-reverse')}>
				<div className="body">
					{title && <Title size={2} value={title} />}
					{text && <Content value={text} />}
				</div>

				{media && <Media {...media} className="text-media-figure" />}
			</Container>
		</Section>
	);
};

export default TextMedia;
