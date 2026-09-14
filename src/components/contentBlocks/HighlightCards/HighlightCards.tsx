import Actions from '@/components/basics/Actions/Actions';
import Badge from '@/components/basics/Badge/Badge';
import Container from '@/components/basics/Container/Container';
import Content from '@/components/basics/Content/Content';
import Media from '@/components/basics/Media/Media';
import Section from '@/components/basics/Section/Section';
import Title from '@/components/basics/Title/Title';
import Card from '@/components/components/Card/Card';
import HeadingGroup from '@/components/components/HeadingGroup/HeadingGroup';

import type { HighlightCardsProps as HighlightCardsSchemaProps } from './HighlightCards.schema';

import './HighlightCards.scss';

type HighlightCardsProps = HighlightCardsSchemaProps;

const HighlightCards = ({
	heading,
	columns = 3,
	items = [],
	colorset,
}: HighlightCardsProps) => {
	return (
		<Section colorset={colorset} className="highlight-cards">
			<Container>
				<HeadingGroup {...heading} element="header" className="highlight-cards-header" />

				<ul className="highlight-cards-grid" style={{ '--columns': columns } as React.CSSProperties}>
					{items.map((item, index) => (
						<li key={item.id}>
							<Card
								variant="polaroid"
								className="highlight-cards-highlight-card"
								tagline={item.tagline}
								header={item.title ? <Title element="h3" size={4} value={item.title} /> : undefined}
								image={
									<>
										{item.media && <Media {...item.media} ratio={item.media.ratio ?? '5 / 4'} className="highlight-cards-photo" />}

										<span className="highlight-cards-index" aria-hidden="true">{index + 1}</span>

										{item.badges && item.badges.length > 0 && (
											<div className="highlight-cards-badges">
												{item.badges.map((badge) => (
													<Badge key={badge} variant="primary" value={badge} />
												))}
											</div>
										)}
									</>
								}
							>
								{item.value && <Content size="small" value={item.value} />}
								{item.actions && <Actions actions={item.actions} defaultVariant="secondary" />}
							</Card>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default HighlightCards;
