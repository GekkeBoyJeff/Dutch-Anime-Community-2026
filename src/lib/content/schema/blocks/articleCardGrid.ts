import { z } from 'zod';

import { ArticleCardProps } from '@/lib/content/schema/components/articleCard';
import { Colorset, FilterOption, Heading, Id, SortOption } from '@/lib/content/schema/primitives';

// The fields the grid card needs, picked from the ArticleCard component's props so both share one
// source of truth for shape and descriptions; `id` is added back for React list keys.
export const ArticleCardGridItem = ArticleCardProps
	.pick({ title: true, href: true, excerpt: true, media: true, tag: true, publishedAt: true })
	.extend({ id: Id })
	.meta({ title: 'ArticleCardGridItem' });
export type ArticleCardGridItem = z.infer<typeof ArticleCardGridItem>;

export const ArticleCardGridProps = z.object({
	colorset: Colorset.optional().describe('Light or dark theme applied to the section'),
	heading: Heading.optional().describe('The section\'s tagline, title and intro shown above the grid'),
	// At least one article — an empty article grid has no reason to exist.
	articles: z.array(ArticleCardGridItem).min(1).describe('The list of articles rendered as cards in the grid'),
	filterable: z.boolean().optional().describe('Shows the category filter chips (built from filterOptions) when true'),
	// The category chips; locale-neutral, supplied by the author (no hardcoded enums).
	filterOptions: z.array(FilterOption).optional().describe('The category filter chips shown above the grid'),
	sortOptions: z.array(SortOption).optional().describe('The options in the sort dropdown; the first is selected by default'),
	searchable: z.boolean().optional().describe('Shows a text search box that matches the article title and excerpt'),
	columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Number of card columns in the grid on wide screens'),
	pageSize: z.number().optional().describe('Number of articles shown per page; omit or 0 shows all articles on one page'),
	emptyMessage: z.string().optional().describe('Message shown when the filters or search leave no articles to display'),
}).meta({ title: 'ArticleCardGrid' });
export type ArticleCardGridProps = z.infer<typeof ArticleCardGridProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const ArticleCardGridBlock = ArticleCardGridProps.extend({
	type: z.literal('articleCardGrid'),
	id: Id.optional(),
});
export type ArticleCardGridBlock = z.infer<typeof ArticleCardGridBlock>;
