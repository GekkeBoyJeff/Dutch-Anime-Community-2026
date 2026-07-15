import type { Ref } from 'react';

import Actions from '@/components/basics/Actions';
import Badge from '@/components/basics/Badge';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import type { HighlightCardsProps } from '@/lib/content';

// Polaroid-style cards: a 5:4 photo with floating badges, a running card number, then tagline,
// title, body and a row of actions. Composes the Card shell (variant 'polaroid'); only the
// block-specific overlays (index chip, badges) and the action row live here. A presentational
// section — all data arrives via props.
const HighlightCards = ({
	heading,
	columns = 3,
	items = [],
	colorset,
	ref,
}: HighlightCardsProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="highlight-cards">
			<Container>
				<HeadingGroup
					tagline={heading?.tagline}
					title={heading?.value}
					size={heading?.size}
					intro={heading?.intro}
					element="header"
					className="header"
				/>

				<ul className="grid" style={{ '--columns': columns } as React.CSSProperties}>
					{items.map((item, index) => (
						<li key={item.id}>
							<Card
								variant="polaroid"
								className="highlight-card"
								tagline={item.tagline}
								header={item.title ? <Title element="h3" size={4} value={item.title} /> : undefined}
								image={
									<>
										{item.media && <Media {...item.media} ratio={item.media.ratio ?? '5 / 4'} className="photo" />}

										<span className="index" aria-hidden="true">{index + 1}</span>

										{item.badges && item.badges.length > 0 && (
											<div className="badges">
												{item.badges.map((badge) => (
													<Badge key={badge} variant="primary">{badge}</Badge>
												))}
											</div>
										)}
									</>
								}
							>
								{item.text && <Content size="small" value={item.text} />}
								<Actions actions={item.actions} defaultVariant="secondary" />
							</Card>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default HighlightCards;
