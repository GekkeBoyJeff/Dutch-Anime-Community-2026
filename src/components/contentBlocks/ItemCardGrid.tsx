'use client';

import { useId, useMemo, useState } from 'react';
import type { ReactNode, Ref } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Pill from '@/components/basics/Pill';
import Section from '@/components/basics/Section';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import ArticleCard from '@/components/components/ArticleCard';
import Card from '@/components/components/Card';
import EmptyState from '@/components/components/EmptyState';
import EventCard from '@/components/components/EventCard';
import Select from '@/components/forms/Select';
import TextInput from '@/components/forms/TextInput';
import { classNames } from '@/lib/classNames';
import type { Colorset, EventCardProps, Heading, Media as MediaData } from '@/lib/content';

// The shared item shape: enough metadata to render any card variant, filter by category and search
// by text. The card-specific extras (date, location, author …) ride along untyped per variant.
export interface CardGridItem {
	/** Stable key + filter/search anchor */
	id: string | number;
	title: string;
	/** Whole-card link target */
	href?: string;
	/** Short summary / excerpt, also matched by the search box */
	text?: string;
	media?: MediaData;
	/** The category value this item belongs to (matched against the filter chips) */
	category?: string;
	/** ISO start date — used by event cards and the date sort */
	startDate?: string;
	/** ISO end date — used by event cards */
	endDate?: string;
	/** Where it happens — event cards */
	location?: string;
	/** A status label — event cards */
	status?: string;
	/** Status chip variant — event cards */
	statusVariant?: EventCardProps['statusVariant'];
	/** Localised meta labels — event cards */
	translations?: EventCardProps['translations'];
	/** A single topic tag — article cards */
	tag?: string;
}

export interface CardGridCategory {
	label: string;
	/** The value matched against each item's `category` */
	value: string;
	/** Optional count shown beside the label */
	count?: number;
}

export interface CardGridSortOption {
	label: string;
	value: 'recent' | 'oldest' | 'title';
}

export interface ItemCardGridProps {
	items?: CardGridItem[];
	/** Which card to render per item */
	variant?: 'article' | 'event' | 'link';
	heading?: Heading;
	/** A featured/lead slot rendered above the grid (e.g. a hero card) */
	featured?: ReactNode;
	/** Filter chips; an "All" chip is prepended automatically */
	categories?: CardGridCategory[];
	/** Shows a text search box that matches title + summary */
	searchable?: boolean;
	/** Sort options; the first is the default. Omit to leave the items in source order */
	sortOptions?: CardGridSortOption[];
	/** Grid width on wide screens */
	columns?: 1 | 2 | 3 | 4;
	/** Card density passed to the card variant */
	cardSize?: 'compact' | 'standard';
	/** Page size; 0 (default) shows everything on one page */
	pageSize?: number;
	/** Shown when the filters/search leave no results */
	emptyMessage?: string;
	/** Label for the "all categories" chip */
	allLabel?: string;
	/** Accessible label for the filter chip group */
	filtersLabel?: string;
	/** Accessible label for the search box */
	searchLabel?: string;
	/** Accessible label for the sort control */
	sortLabel?: string;
	/** Accessible label for the pagination nav */
	paginationLabel?: string;
	colorset?: Colorset;
}

// Sorts a copy by the chosen key. `recent`/`oldest` lean on the ISO `startDate`; missing dates sink
// to the end so a half-populated list stays sensible.
const sortItems = (items: CardGridItem[], sort: CardGridSortOption['value']): CardGridItem[] => {
	if (sort === 'title') {
		return [...items].sort((a, b) => a.title.localeCompare(b.title));
	}

	const direction = sort === 'oldest' ? 1 : -1;

	return [...items].sort((a, b) => {
		const aTime = a.startDate ? new Date(a.startDate).getTime() : Number.NaN;
		const bTime = b.startDate ? new Date(b.startDate).getTime() : Number.NaN;

		if (Number.isNaN(aTime)) return 1;
		if (Number.isNaN(bTime)) return -1;

		return (aTime - bTime) * direction;
	});
};

// Renders one item as the requested card variant, mapping the generic shape onto that card's props.
const renderCard = (item: CardGridItem, variant: ItemCardGridProps['variant']) => {
	if (variant === 'event') {
		return (
			<EventCard
				title={item.title}
				summary={item.text}
				startDate={item.startDate}
				endDate={item.endDate}
				location={item.location}
				status={item.status}
				statusVariant={item.statusVariant}
				translations={item.translations}
				media={item.media}
				href={item.href}
			/>
		);
	}

	if (variant === 'article') {
		return (
			<ArticleCard
				title={item.title}
				excerpt={item.text}
				media={item.media}
				tag={item.tag ?? item.category}
				publishedAt={item.startDate}
				href={item.href}
				layout="vertical"
			/>
		);
	}

	// 'link' / fallback: a plain titled Card whose stretched link makes the whole surface the target.
	return (
		<Card href={item.href} linkLabel={item.title} className="link-card">
			<Content element="span" className="link-card-title" value={item.title} />
			{item.text && <Content element="span" className="link-card-text" value={item.text} />}
		</Card>
	);
};

// The generalised, filterable card grid all the typed grids share. Holds the active filter, the
// search query and the current page in local state, then derives the visible slice with useMemo so a
// large list re-filters cheaply. A client island; the typed block wrappers around it stay server-
// renderable because every prop crossing the boundary is plain data (no render props).
const ItemCardGrid = ({
	items = [],
	variant = 'article',
	heading,
	featured,
	categories = [],
	searchable = false,
	sortOptions = [],
	columns = 3,
	cardSize = 'standard',
	pageSize = 0,
	emptyMessage = 'Nothing matches your filters yet.',
	allLabel = 'All',
	filtersLabel = 'Filteren op categorie',
	searchLabel = 'Search',
	sortLabel = 'Sort by',
	paginationLabel = 'Pagination',
	colorset,
	ref,
}: ItemCardGridProps & { ref?: Ref<HTMLElement> }) => {
	const searchId = useId();

	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [sort, setSort] = useState<CardGridSortOption['value'] | null>(sortOptions[0]?.value ?? null);
	const [page, setPage] = useState(0);

	const filtered = useMemo(() => {
		const needle = query.trim().toLowerCase();

		let next = items.filter((item) => {
			const inCategory = !activeCategory || item.category === activeCategory;
			const inSearch =
				!needle ||
				item.title.toLowerCase().includes(needle) ||
				(item.text?.toLowerCase().includes(needle) ?? false);

			return inCategory && inSearch;
		});

		if (sort) {
			next = sortItems(next, sort);
		}

		return next;
	}, [items, activeCategory, query, sort]);

	const pageCount = pageSize > 0 ? Math.ceil(filtered.length / pageSize) : 1;
	const safePage = Math.min(page, Math.max(0, pageCount - 1));
	const visible = pageSize > 0 ? filtered.slice(safePage * pageSize, safePage * pageSize + pageSize) : filtered;

	// Any control that changes the result set resets to the first page so the reader isn't stranded on
	// an empty trailing page.
	const pickCategory = (value: string | null) => {
		setActiveCategory(value);
		setPage(0);
	};

	return (
		<Section ref={ref} colorset={colorset} className="item-card-grid">
			<Container>
				<HeadingGroup
					tagline={heading?.tagline}
					title={heading?.value}
					size={heading?.size}
					intro={heading?.intro}
					element="header"
					className="header"
				/>

				{featured && <div className="featured">{featured}</div>}

				{(categories.length > 0 || searchable || sortOptions.length > 0) && (
					<div className="controls">
						{categories.length > 0 && (
							<div className="filters" role="group" aria-label={filtersLabel}>
								<Pill active={activeCategory === null} onClick={() => pickCategory(null)}>
									{allLabel}
								</Pill>

								{categories.map((category) => (
									<Pill
										key={category.value}
										active={activeCategory === category.value}
										onClick={() => pickCategory(category.value)}
									>
										{category.label}
										{typeof category.count === 'number' && (
											<span className="count" aria-hidden="true">
												{' '}
												{category.count}
											</span>
										)}
									</Pill>
								))}
							</div>
						)}

						<div className="tools">
							{searchable && (
								<div className="search">
									<label htmlFor={searchId}>
										<VisuallyHidden>{searchLabel}</VisuallyHidden>
									</label>
									<TextInput
										id={searchId}
										type="search"
										placeholder={searchLabel}
										value={query}
										onChange={(event) => {
											setQuery(event.target.value);
											setPage(0);
										}}
									/>
								</div>
							)}

							{sortOptions.length > 0 && (
								<div className="sort">
									{/* A visible cue beside the control; the Select carries its own accessible name via aria-label. */}
									<span className="sort-label">{sortLabel}</span>
									<Select
										native
										aria-label={sortLabel}
										value={sort ?? ''}
										onValueChange={(value) => {
											setSort(value as CardGridSortOption['value']);
											setPage(0);
										}}
										options={sortOptions.map((option) => ({ value: option.value, label: option.label }))}
									/>
								</div>
							)}
						</div>
					</div>
				)}

				{visible.length > 0 ? (
					<ul className="grid" style={{ '--grid-columns': columns } as React.CSSProperties}>
						{visible.map((item) => {
							return (
								<li key={item.id} className={classNames('cell', `is-${cardSize}`)}>
									{renderCard(item, variant)}
								</li>
							);
						})}
					</ul>
				) : (
					<EmptyState title={emptyMessage} compact className="empty" />
				)}

				{pageCount > 1 && (
					<nav className="pagination" aria-label={paginationLabel}>
						<Interactive
							className="page-step"
							disabled={safePage === 0}
							onClick={() => setPage((current) => Math.max(0, current - 1))}
						>
							<VisuallyHidden>Previous page</VisuallyHidden>
							<Icon name="chevron-left" />
						</Interactive>

						<Content element="p" className="page-status" aria-live="polite">
							{safePage + 1} / {pageCount}
						</Content>

						<Interactive
							className="page-step"
							disabled={safePage >= pageCount - 1}
							onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
						>
							<VisuallyHidden>Next page</VisuallyHidden>
							<Icon name="chevron-right" />
						</Interactive>
					</nav>
				)}
			</Container>
		</Section>
	);
};

export default ItemCardGrid;
