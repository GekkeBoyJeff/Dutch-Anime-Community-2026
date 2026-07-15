import type { Ref } from 'react';

import Actions from '@/components/basics/Actions';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import { classNames } from '@/lib/classNames';
import type { TitleTextProps } from '@/lib/content';

// A stacked prose block: heading cluster, rich-text body and a row of actions. The simplest
// title + text + CTA composition. Server Component — the clickable island lives inside Button.
const TitleText = ({
	heading,
	text,
	actions = [],
	align = 'start',
	colorset,
	ref,
}: TitleTextProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="title-text">
			<Container className={classNames('body', `is-${align}`)}>
				{heading && (
					<HeadingGroup
						align={align}
						tagline={heading.tagline}
						title={heading.value}
						size={heading.size}
						intro={heading.intro}
					/>
				)}

				{text && <Content className="text" value={text} />}

				<Actions actions={actions} defaultVariant="primary" />
			</Container>
		</Section>
	);
};

export default TitleText;
