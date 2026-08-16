import { z } from 'zod';

import { ArticleCardProps } from '@/lib/content/schema/components/articleCard';
import { EventCardProps } from '@/lib/content/schema/components/eventCard';
import { Colorset, FilterOption, Heading, Id, SortOption } from '@/lib/content/schema/primitives';

// One item shape per card variant, each picked from that card's own props so the grid and the card
// keep a single source of truth for shape and descriptions; `id` is added back for React list keys.
// These are also what the editor asks for: lib/puck/config swaps the `items` field to match the
// chosen variant, so an author only ever sees the fields their card actually renders.

export const ArticleCardGridItem = ArticleCardProps
	.pick({ title: true, href: true, excerpt: true, media: true, tag: true, publishedAt: true })
	.extend({ id: Id })
	.meta({ title: 'ArticleCardGridItem' });
export type ArticleCardGridItem = z.infer<typeof ArticleCardGridItem>;

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

export const LinkCardGridItem = z
	.object({
		id: Id,
		url: z.string().min(1).describe('Destination the whole card links to'),
		// Optional leading glyph (the icon font is a placeholder, so it is never required).
		icon: z.string().optional().describe('Name of the optional icon rendered before the title').meta({ editor: 'icon' }),
		title: z.string().min(1).describe('Card heading text'),
		description: z.string().optional().describe('Supporting text rendered below the title'),
		cta: z.string().optional().describe('Call-to-action label rendered beside the trailing arrow'),
	})
	.meta({ title: 'LinkCardGridItem' });
export type LinkCardGridItem = z.infer<typeof LinkCardGridItem>;

export const CARD_GRID_ITEM_BY_VARIANT = {
	article: ArticleCardGridItem,
	event: EventCardGridItem,
	link: LinkCardGridItem,
} as const;

// What actually gets stored: every variant's fields, all optional. Keeping it one flat object means
// `Block` stays a plain discriminated union on `type` — nesting a second union inside it would break
// both the union and the field derivation. The refinement below is what enforces the real contract:
// each item is parsed against its variant's schema, so an event without a startDate still fails the
// build, pointed at the exact item.
const CardGridItem = z
	.object({
		...ArticleCardGridItem.partial().shape,
		...EventCardGridItem.partial().shape,
		...LinkCardGridItem.partial().shape,
		// Required whatever the variant, so the renderer never has to guess at a missing heading.
		id: Id,
		title: z.string().min(1).describe('Card heading text'),
	})
	.meta({ title: 'CardGridItem' });

export const CardGridProps = z
	.object({
		variant: z.enum(['article', 'event', 'link']).describe('Which card the grid renders; it also decides which fields each item asks for'),
		colorset: Colorset.optional().describe('Light or dark theme applied to the section'),
		heading: Heading.optional().describe('The section\'s tagline, title and intro shown above the grid'),
		// An empty grid has no reason to exist.
		items: z.array(CardGridItem).min(1).describe('The cards rendered in the grid'),
		filterable: z.boolean().optional().describe('Shows the category filter chips (built from filterOptions) when true'),
		// The category chips; locale-neutral, supplied by the author (no hardcoded enums).
		filterOptions: z.array(FilterOption).optional().describe('The category filter chips shown above the grid'),
		sortOptions: z.array(SortOption).optional().describe('The options in the sort dropdown; the first is selected by default'),
		searchable: z.boolean().optional().describe('Shows a text search box that matches the card title and summary'),
		allLabel: z.string().optional().describe('Label for the \'all categories\' filter chip; defaults to \'All\''),
		searchLabel: z.string().optional().describe('Accessible label for the search box; defaults to \'Search\''),
		sortLabel: z.string().optional().describe('Visible label for the sort control; defaults to \'Sort by\''),
		cardSize: z.enum(['compact', 'standard']).optional().describe('Card density passed to the card variant'),
		columns: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Number of card columns on wide screens'),
		pageSize: z.number().optional().describe('Number of cards shown per page; omit or 0 shows everything on one page'),
		emptyMessage: z.string().optional().describe('Message shown when the filters or search leave nothing to display'),
	})
	.check((ctx) => {
		const shape = CARD_GRID_ITEM_BY_VARIANT[ctx.value.variant];
		ctx.value.items.forEach((item, index) => {
			const result = shape.safeParse(item);
			if (result.success) return;
			for (const issue of result.error.issues) {
				ctx.issues.push({ code: 'custom', message: issue.message, input: item, path: ['items', index, ...issue.path] });
			}
		});
	})
	.meta({ title: 'CardGrid' });
export type CardGridProps = z.infer<typeof CardGridProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const CardGridBlock = CardGridProps.extend({
	type: z.literal('cardGrid'),
	id: Id.optional(),
});
export type CardGridBlock = z.infer<typeof CardGridBlock>;
