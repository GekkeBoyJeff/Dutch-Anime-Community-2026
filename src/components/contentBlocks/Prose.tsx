import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Section from '@/components/basics/Section';
import type { ProseProps as ProseSchemaProps } from '@/lib/site/content/schema/blocks/prose';

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
