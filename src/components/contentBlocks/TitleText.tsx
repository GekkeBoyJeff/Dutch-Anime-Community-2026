import Actions from '@/components/basics/Actions';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Section from '@/components/basics/Section';
import { classNames } from '@/lib/shared/classNames';
import type { TitleTextProps as TitleTextSchemaProps } from '@/lib/site/content/schema/blocks/titleText';

type TitleTextProps = TitleTextSchemaProps;

const TitleText = ({
	heading,
	value,
	actions = [],
	align = 'start',
	colorset,
}: TitleTextProps) => {
	return (
		<Section colorset={colorset} className="title-text">
			<Container className={classNames('title-text-body', `is-${align}`)}>
				{heading && <HeadingGroup {...heading} align={align} />}

				{value && <Content className="title-text-body" value={value} />}

				<Actions actions={actions} defaultVariant="primary" />
			</Container>
		</Section>
	);
};

export default TitleText;
