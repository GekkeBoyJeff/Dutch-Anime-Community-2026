import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Media from '@/components/basics/Media';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import Card from '@/components/components/Card';
import { classNames } from '@/lib/shared/classNames';
import type { BentoGridProps as BentoGridSchemaProps, BentoItem } from '@/lib/site/content/schema/blocks/bentoGrid';

type BentoGridProps = BentoGridSchemaProps;

const TileBody = ({ item }: { item: BentoItem }) => {
	const hasCta = !!item.cta?.value;

	return (
		<>
			{item.media && <Media {...item.media} className="bento-grid-bento-media" />}

			<div className="bento-grid-bento-content">
				{item.tagline && <Content element="p" className="bento-grid-tagline" value={item.tagline} />}
				{item.title && <Title element="h3" size={4} value={item.title} />}
				{item.value && <Content size="small" value={item.value} />}

				{hasCta && (
					<span className="bento-grid-cta">
						{item.cta?.value}
						{item.cta?.icon && <Icon name={item.cta.icon} />}
					</span>
				)}
			</div>
		</>
	);
};

const BentoGrid = ({
	heading,
	columns = 4,
	items = [],
	colorset,
}: BentoGridProps) => {
	return (
		<Section colorset={colorset} className="bento-grid">
			<Container>
				<HeadingGroup {...heading} element="header" className="bento-grid-header" />

				<ul className="bento-grid-list" style={{ '--bento-columns': columns } as React.CSSProperties}>
					{items.map((item) => {
						const href = item.href ?? item.cta?.url;
						const span = item.span ?? 'standard';
						const isOverlay = !!item.media && (span === 'feature' || span === 'tall');

						return (
							<li key={item.id} className={classNames('bento-grid-tile-cell', `is-${span}`)}>
								<Card
									href={href}
									linkLabel={item.title ?? item.cta?.value ?? item.tagline}
									className={classNames('bento-grid-tile', `is-surface-${item.surface ?? 'default'}`, isOverlay && 'is-overlay')}
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
