'use client';

import { useMemo } from 'react';
import type { Ref } from 'react';

import ItemCardGrid from '@/components/contentBlocks/ItemCardGrid';
import type { CardGridItem } from '@/components/contentBlocks/ItemCardGrid';
import type { EventCardGridProps } from '@/lib/content';

// Event-listing card grid: maps a list of events onto the shared, filterable ItemCardGrid with the
// event card variant. The filter/sort options are props (no hardcoded enums) so any locale and any
// event taxonomy works; date sorting runs on each event's ISO startDate.
const EventCardGrid = ({
	heading,
	events = [],
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
}: EventCardGridProps & { ref?: Ref<HTMLElement> }) => {
	const items = useMemo<CardGridItem[]>(
		() =>
			events.map((event) => ({
				id: event.id,
				title: event.title,
				href: event.href,
				text: event.summary,
				media: event.media,
				category: event.category,
				startDate: event.startDate,
				endDate: event.endDate,
				location: event.location,
				status: event.status,
				statusVariant: event.statusVariant,
				translations: event.translations,
			})),
		[events],
	);

	return (
		<ItemCardGrid
			ref={ref}
			variant="event"
			items={items}
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

export default EventCardGrid;
