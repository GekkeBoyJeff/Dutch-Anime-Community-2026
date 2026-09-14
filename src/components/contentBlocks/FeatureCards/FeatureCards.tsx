import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import Media from '@/components/basics/Media/Media';
import Section from '@/components/basics/Section/Section';
import Title from '@/components/basics/Title/Title';
import Card from '@/components/components/Card/Card';
import HeadingGroup from '@/components/components/HeadingGroup/HeadingGroup';

import type { FeatureCardsProps as FeatureCardsSchemaProps } from './FeatureCards.schema';

import './FeatureCards.scss';

type FeatureCardsProps = FeatureCardsSchemaProps;

const FeatureCards = ({
	title,
	intro,
	items = [],
	colorset,
}: FeatureCardsProps) => {
	return (
		<Section colorset={colorset} className="feature-cards">
			<Container>
				<HeadingGroup element="header" title={title} intro={intro} />

				<ul className="feature-cards-grid">
					{items.map((item) => (
						<li key={item.id}>
							<Card
								image={item.media && <Media {...item.media} />}
								header={<Title element="h3" size={4} value={item.title} />}
							>
								<Content size="small" value={item.value} />
							</Card>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default FeatureCards;
