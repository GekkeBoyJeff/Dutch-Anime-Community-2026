import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import type { LinkCardGridProps } from '@/lib/content';

// A grid of clickable cards: each card is a Card shell with a stretched link, so the whole surface
// is the hit target. An optional icon, a title, a description, a CTA label and a drawn trailing arrow.
const LinkCardGrid = ({
	heading,
	description,
	columns = 3,
	items = [],
	colorset,
	ref,
}: LinkCardGridProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="link-card-grid">
			<Container>
				<HeadingGroup
					tagline={heading?.tagline}
					title={heading?.value}
					size={heading?.size}
					intro={heading?.intro ?? description}
					element="header"
					className="header"
				/>

				<ul className="grid" style={{ '--link-grid-columns': columns } as React.CSSProperties}>
					{items.map((item) => (
						<li key={item.id} className="item">
							<Card href={item.url} linkLabel={item.title} className="link-card">
								{item.icon && (
									<span className="icon-wrap" aria-hidden="true">
										<Icon name={item.icon} />
									</span>
								)}

								<div className="body">
									<Title element="h3" size={5} value={item.title} />
									{item.description && <Content size="small" value={item.description} />}
									{item.cta && <Content element="span" className="cta">{item.cta}</Content>}
								</div>

								<span className="arrow" aria-hidden="true" />
							</Card>
						</li>
					))}
				</ul>
			</Container>
		</Section>
	);
};

export default LinkCardGrid;
