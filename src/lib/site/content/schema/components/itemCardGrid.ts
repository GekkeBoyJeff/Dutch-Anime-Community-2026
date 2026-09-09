import type { ReactNode } from 'react';
import { z } from 'zod';

import { EventCardTranslations } from '@/lib/site/content/schema/components/eventCard';
import { Colorset, FilterOption, Heading, Id, Media, SortOption, StatusVariant } from '@/lib/site/content/schema/primitives';

export const CardGridItem = z
	.object({
		id: Id.describe('Stable key for the card in the list'),
		title: z.string().min(1).describe('Card heading text; also what the search and the title sort match on'),
		href: z.string().optional().describe('Whole-card link target'),
		text: z.string().optional().describe('Supporting text — the article excerpt, event summary or link description'),
		media: Media.optional().describe('Lead media (image/video/embed)'),
		category: z.string().optional().describe('The category value matched against the filter chips'),
		startDate: z.string().optional().describe('ISO start date/time; drives the date sort'),
		endDate: z.string().optional().describe('ISO end date/time, used to show a time range'),
		location: z.string().optional().describe('Where it happens (venue, city, or \'Online\')'),
		status: z.string().optional().describe('A status chip, e.g. \'Sold out\' or \'Free\''),
		statusVariant: StatusVariant.optional().describe('Status chip variant'),
		translations: EventCardTranslations.optional().describe('Localised strings for the event card\'s meta labels'),
		tag: z.string().optional().describe('Tag shown on the article card; falls back to the category'),
		icon: z.string().optional().describe('Leading icon glyph name on the link card (see the $icons map)'),
		cta: z.string().optional().describe('Call-to-action label rendered beside the link card\'s trailing arrow'),
	})
	.meta({ title: 'CardGridItem' });
export type CardGridItem = z.infer<typeof CardGridItem>;

export const ItemCardGridProps = z
	.object({
		items: z.array(CardGridItem).optional().describe('The cards rendered in the grid; defaults to []'),
		featured: z.custom<ReactNode>().optional().describe('Standout content rendered between the heading and the filter controls'),
		variant: z.enum(['article', 'event', 'link']).optional().describe('Which card each item renders as; defaults to \'article\''),
		heading: Heading.optional().describe('The section\'s tagline, title and intro shown above the grid'),
		categories: z.array(FilterOption).optional().describe('The category filter chips shown above the grid; defaults to []'),
		searchable: z.boolean().optional().describe('Shows a text search box that matches the card title and text; defaults to false'),
		sortOptions: z.array(SortOption).optional().describe('The options in the sort dropdown; the first is selected by default'),
		columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Number of card columns on wide screens; defaults to 3'),
		cardSize: z.enum(['compact', 'standard']).optional().describe('Card density passed to the card variant; defaults to \'standard\''),
		pageSize: z.number().optional().describe('Number of cards shown per page; omit or 0 shows everything on one page'),
		emptyMessage: z.string().optional().describe('Message shown when the filters or search leave nothing to display'),
		allLabel: z.string().optional().describe('Label for the \'all categories\' filter chip; defaults to \'All\''),
		filtersLabel: z.string().optional().describe('Accessible label for the filter chip group'),
		searchLabel: z.string().optional().describe('Accessible label and placeholder for the search box; defaults to \'Search\''),
		sortLabel: z.string().optional().describe('Visible label for the sort control; defaults to \'Sort by\''),
		paginationLabel: z.string().optional().describe('Accessible label for the pagination nav; defaults to \'Pagination\''),
		colorset: Colorset.optional(),
	})
	.meta({ title: 'ItemCardGrid' });
export type ItemCardGridProps = z.infer<typeof ItemCardGridProps>;
