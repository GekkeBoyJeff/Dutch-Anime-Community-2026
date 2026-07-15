import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import SectionHeader from '@/components/contentBlocks/SectionHeader';
import type { FeatureCardsProps } from '@/lib/content';

// A complete page section: header group + grid of cards. Gets all its data via props and never
// fetches — the page fetches and passes it down. Each card composes the Card component (the section
// owns only the grid layout); this whole section is a block.
const FeatureCards = ({
	title,
	intro,
	items = [],
	colorset,
	ref,
}: FeatureCardsProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="feature-cards">
			<Container>
				<SectionHeader title={title} intro={intro} />

				<ul className="grid">
					{items.map((item) => (
						<li key={item.id}>
							<Card
								image={item.media && <Media {...item.media} />}
								header={<Title element="h3" size={4} value={item.title} />}
							>
								<Content size="small" value={item.body} />
							</Card>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default FeatureCards;
