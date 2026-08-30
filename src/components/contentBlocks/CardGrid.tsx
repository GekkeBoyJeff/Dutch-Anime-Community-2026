'use client';

import { useMemo } from 'react';

import ItemCardGrid from '@/components/components/ItemCardGrid';
import type { CardGridItem } from '@/components/components/ItemCardGrid';
import type { CardGridProps as CardGridSchemaProps } from '@/lib/site/content/schema/blocks/cardGrid';

type CardGridProps = CardGridSchemaProps;

const toGridItem = (item: CardGridProps['items'][number]): CardGridItem => ({
	id: item.id,
	title: item.title,
	href: item.href,
	text: item.value,
	media: item.media,
	tag: item.tag,
	category: item.category ?? item.tag,
	startDate: item.startDate ?? item.publishedAt,
	endDate: item.endDate,
	location: item.location,
	status: item.status,
	statusVariant: item.statusVariant,
	translations: item.translations,
	icon: item.icon,
	cta: item.cta,
});

// An event runs until the end of its last day. A static build bakes its HTML long before the visit,
// so this runs in the browser: the first paint may still show an event that ended since the build.
const isOver = (item: CardGridProps['items'][number]) => {
	const end = item.endDate ?? item.startDate;
	return !!end && end.slice(0, 10) < new Date().toISOString().slice(0, 10);
};

const CardGrid = ({
	variant,
	heading,
	items = [],
	filterable = false,
	filterOptions = [],
	sortOptions = [],
	searchable = false,
	cardSize = 'standard',
	columns = 3,
	pageSize = 0,
	emptyMessage,
	allLabel,
	searchLabel,
	sortLabel,
	colorset,
}: CardGridProps) => {
	const gridItems = useMemo(
		() => items.filter((item) => variant !== 'event' || !isOver(item)).map(toGridItem),
		[items, variant],
	);

	return (
		<ItemCardGrid
			variant={variant}
			items={gridItems}
			heading={heading}
			categories={filterable ? filterOptions : []}
			searchable={searchable}
			sortOptions={sortOptions}
			cardSize={cardSize}
			columns={columns}
			pageSize={pageSize}
			emptyMessage={emptyMessage}
			allLabel={allLabel}
			searchLabel={searchLabel}
			sortLabel={sortLabel}
			colorset={colorset}
		/>
	);
};

export default CardGrid;
