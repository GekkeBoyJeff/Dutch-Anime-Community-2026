import Actions from '@/components/basics/Actions';
import Badge from '@/components/basics/Badge';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import type { HighlightCardsProps as HighlightCardsSchemaProps } from '@/lib/site/content/schema/blocks/highlightCards';

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
