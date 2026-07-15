import type { Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import { classNames } from '@/lib/classNames';
import type { BentoGridProps, BentoItem } from '@/lib/content';

// The inner content of a tile, shared by the linked and the static variants so they never drift.
const TileBody = ({ item }: { item: BentoItem }) => {
	const hasCta = !!item.cta?.label;

	return (
		<>
			{item.media && <Media {...item.media} className="bento-media" />}

			<div className="bento-content">
				{item.tagline && <Content element="p" className="tagline" value={item.tagline} />}
				{item.title && <Title element="h3" size={4} value={item.title} />}
				{item.body && <Content size="small" value={item.body} />}

				{hasCta && (
					<span className="cta">
						{item.cta?.label}
						{item.cta?.icon && <Icon name={item.cta.icon} />}
					</span>
				)}
			</div>
		</>
	);
};

// Magazine-style asymmetric grid: each tile claims a span (feature/wide/tall/standard) and a surface
// tint. Each tile is a Card shell — a `url` makes it one big clickable target via the stretched
// link; otherwise it is a static card. The grid spans stay on the <li> (the grid cell).
const BentoGrid = ({
	heading,
	description,
	columns = 4,
	items = [],
	colorset,
	ref,
}: BentoGridProps & { ref?: Ref<HTMLElement> }) => {
	return (
		<Section ref={ref} colorset={colorset} className="bento-grid">
			<Container>
				<HeadingGroup
					tagline={heading?.tagline}
					title={heading?.value}
					size={heading?.size}
					intro={heading?.intro ?? description}
					element="header"
					className="header"
				/>

				<ul className="grid" style={{ '--bento-columns': columns } as React.CSSProperties}>
					{items.map((item) => {
						const href = item.url ?? item.cta?.url;
						const span = item.span ?? 'standard';
						const isOverlay = !!item.media && (span === 'feature' || span === 'tall');

						return (
							<li key={item.id} className={classNames('tile-cell', `is-${span}`)}>
								<Card
									href={href}
									linkLabel={item.title ?? item.cta?.label ?? item.tagline}
									className={classNames('tile', `surface-${item.surface ?? 'default'}`, isOverlay && 'is-overlay')}
								>
									<TileBody item={item} />
								</Card>
							</li>
						);
					})}
				</ul>
			</Container>
		</Section>
	);
};

export default BentoGrid;
