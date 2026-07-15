'use client';

import { useMemo } from 'react';
import type { Ref } from 'react';

import ItemCardGrid from '@/components/contentBlocks/ItemCardGrid';
import type { CardGridItem } from '@/components/contentBlocks/ItemCardGrid';
import type { ArticleCardGridProps } from '@/lib/content';

// Article-listing card grid: maps a list of articles onto the shared, filterable ItemCardGrid with
// the article card variant. Filter chips, a search box, sorting and pagination all come from the
// generic internal — this wrapper only adapts the article shape and forwards the author's options.
const ArticleCardGrid = ({
	heading,
	articles = [],
	filterable = false,
	filterOptions = [],
	sortOptions = [],
	searchable = false,
	columns = 3,
	pageSize = 0,
	emptyMessage,
	colorset,
	ref,
}: ArticleCardGridProps & { ref?: Ref<HTMLElement> }) => {
	const items = useMemo<CardGridItem[]>(
		() =>
			articles.map((article) => ({
				id: article.id,
				title: article.title,
				href: article.href,
				text: article.excerpt,
				media: article.media,
				tag: article.tag,
				category: article.tag,
				startDate: article.publishedAt,
			})),
		[articles],
	);

	return (
		<ItemCardGrid
			ref={ref}
			variant="article"
			items={items}
			heading={heading}
			categories={filterable ? filterOptions : []}
			searchable={searchable}
			sortOptions={sortOptions}
			columns={columns}
			pageSize={pageSize}
			emptyMessage={emptyMessage}
			colorset={colorset}
		/>
	);
};

export default ArticleCardGrid;
