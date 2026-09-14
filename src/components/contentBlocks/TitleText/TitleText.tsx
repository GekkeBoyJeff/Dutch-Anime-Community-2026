import Actions from '@/components/basics/Actions/Actions';
import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import Section from '@/components/basics/Section/Section';
import HeadingGroup from '@/components/components/HeadingGroup/HeadingGroup';
import { classNames } from '@/lib/shared/classNames';

import type { TitleTextProps as TitleTextSchemaProps } from './TitleText.schema';

import './TitleText.scss';

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
