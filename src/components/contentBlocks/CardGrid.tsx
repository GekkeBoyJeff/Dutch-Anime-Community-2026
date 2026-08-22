'use client';

import { useMemo } from 'react';
import type { Ref } from 'react';

import ItemCardGrid from '@/components/components/ItemCardGrid';
import type { CardGridItem } from '@/components/components/ItemCardGrid';
import type { CardGridProps } from '@/lib/content';

// One card grid for every card type. The shared ItemCardGrid owns the filter chips, search box,
// sorting and pagination; this block only translates the author's vocabulary into the grid's item
// shape. Each variant names its fields differently — an article's `excerpt`, an event's `summary`, a
// link's `description` — so nothing collides and a single mapping covers all three.
const toGridItem = (item: CardGridProps['items'][number]): CardGridItem => ({
	id: item.id,
	title: item.title,
	href: item.href ?? item.url,
	text: item.excerpt ?? item.summary ?? item.description,
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
	ref,
}: CardGridProps & { ref?: Ref<HTMLElement> }) => {
	const gridItems = useMemo(
		() => items.filter((item) => variant !== 'event' || !isOver(item)).map(toGridItem),
		[items, variant],
	);

	return (
		<ItemCardGrid
			ref={ref}
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
