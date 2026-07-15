import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Section from '@/components/basics/Section';
import type { ProseProps } from '@/lib/content';

// Long-form text (e.g. a blog body). Content renders the HTML as a <div>; the .prose class handles
// the rhythm between headings and paragraphs.
const Prose = ({
	value,
	colorset,
	ref,
}: ProseProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset}>
			<Container>
				<Content element="div" className="prose" value={value} />
			</Container>
		</Section>
	);
};

export default Prose;
