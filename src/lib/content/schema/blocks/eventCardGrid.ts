import { z } from 'zod';

import { EventCardProps } from '@/lib/content/schema/components/eventCard';
import { Colorset, FilterOption, Heading, Id, SortOption } from '@/lib/content/schema/primitives';

// The fields the grid card needs, picked from the EventCard component's props so both share one
// source of truth for shape and descriptions; `id` and `category` are added back for React list
// keys and the filter chips.
export const EventCardGridItem = EventCardProps
	.pick({ title: true, summary: true, startDate: true, endDate: true, location: true, status: true, statusVariant: true, media: true, href: true, translations: true })
	.extend({
		id: Id,
		// Required here (optional on the card itself): the grid's date sort depends on it.
		startDate: z.string().min(1).describe('ISO start date/time; drives the date sort and the standout date chip'),
		category: z.string().optional().describe('The category value matched against the filter chips'),
	})
	.meta({ title: 'EventCardGridItem' });
export type EventCardGridItem = z.infer<typeof EventCardGridItem>;

export const EventCardGridProps = z.object({
	colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
	heading: Heading.optional().describe('Heading cluster (tagline, title, size, intro) shown above the grid'),
	// An empty event grid has no reason to exist.
	events: z.array(EventCardGridItem).min(1).describe('The list of events rendered in the grid'),
	filterable: z.boolean().optional().describe('Shows the filter chips built from `filterOptions`'),
	// Locale-neutral, supplied by the author (no hardcoded meetup/convention enums).
	filterOptions: z.array(FilterOption).optional().describe('The category chips offered for filtering the grid'),
	// The first option is the default; date-based sort runs on the ISO `startDate`.
	sortOptions: z.array(SortOption).optional().describe('The sort options offered above the grid'),
	searchable: z.boolean().optional().describe('Shows a text search box that matches title and summary'),
	allLabel: z.string().optional().describe('Label for the \'all categories\' filter chip; defaults to \'All\''),
	searchLabel: z.string().optional().describe('Accessible label for the search box; defaults to \'Search\''),
	sortLabel: z.string().optional().describe('Visible label for the sort control; defaults to \'Sort by\''),
	cardSize: z.enum(['compact', 'standard']).optional().describe('Card density passed to the event card variant'),
	columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Grid width on wide screens'),
	pageSize: z.number().optional().describe('Number of events shown per page; omit or 0 shows everything on one page'),
	emptyMessage: z.string().optional().describe('Message shown when the filters/search leave no results'),
}).meta({ title: 'EventCardGrid' });
export type EventCardGridProps = z.infer<typeof EventCardGridProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const EventCardGridBlock = EventCardGridProps.extend({
	type: z.literal('eventCardGrid'),
	id: Id.optional(),
});
export type EventCardGridBlock = z.infer<typeof EventCardGridBlock>;
