import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import Section from '@/components/basics/Section/Section';

import type { ProseProps as ProseSchemaProps } from './Prose.schema';

import './Prose.scss';

type ProseProps = ProseSchemaProps;

const Prose = ({
	value,
	colorset,
}: ProseProps) => {
	return (
		<Section colorset={colorset}>
			<Container>
				<Content element="div" className="prose" value={value} />
			</Container>
		</Section>
	);
};

export default Prose;
