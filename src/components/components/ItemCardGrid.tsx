'use client';

import { useId, useMemo, useState } from 'react';

import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import HeadingGroup from '@/components/basics/HeadingGroup';
import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import Pill from '@/components/basics/Pill';
import Section from '@/components/basics/Section';
import Title from '@/components/basics/Title';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import ArticleCard from '@/components/components/ArticleCard';
import Card from '@/components/components/Card';
import EventCard from '@/components/components/EventCard';
import Select from '@/components/forms/Select';
import TextInput from '@/components/forms/TextInput';
import { classNames } from '@/lib/shared/classNames';
import type { CardGridItem, ItemCardGridProps as ItemCardGridSchemaProps } from '@/lib/site/content/schema/components/itemCardGrid';
import type { SortOption } from '@/lib/site/content/schema/primitives';

export type { CardGridItem };

type ItemCardGridProps = ItemCardGridSchemaProps;

const sortItems = (items: CardGridItem[], sort: SortOption['value']): CardGridItem[] => {
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

const renderCard = (item: CardGridItem, variant: ItemCardGridProps['variant']) => {
	if (variant === 'event') {
		return (
			<EventCard
				title={item.title}
				value={item.text}
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
				value={item.text}
				media={item.media}
				tag={item.tag ?? item.category}
				publishedAt={item.startDate}
				href={item.href}
				layout="vertical"
			/>
		);
	}

	return (
		<Card href={item.href} linkLabel={item.title} className="item-card-grid-link-card">
			{item.icon && (
				<span className="item-card-grid-link-card-icon" aria-hidden="true">
					<Icon name={item.icon} />
				</span>
			)}

			<div className="item-card-grid-link-card-body">
				<Title element="h3" size={5} value={item.title} />
				{item.text && <Content size="small" value={item.text} />}
				{item.cta && <Content element="span" className="item-card-grid-link-card-cta" value={item.cta} />}
			</div>

			<span className="item-card-grid-link-card-arrow" aria-hidden="true" />
		</Card>
	);
};

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
}: ItemCardGridProps) => {
	const searchId = useId();

	const [activeCategory, setActiveCategory] = useState<string | null>(null);
	const [query, setQuery] = useState('');
	const [sort, setSort] = useState<SortOption['value'] | null>(sortOptions[0]?.value ?? null);
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

	const pickCategory = (value: string | null) => {
		setActiveCategory(value);
		setPage(0);
	};

	return (
		<Section colorset={colorset} className="item-card-grid">
			<Container>
				<HeadingGroup
					{...heading}
					element="header"
					className="item-card-grid-header"
				/>

				{featured && <div className="item-card-grid-featured">{featured}</div>}

				{(categories.length > 0 || searchable || sortOptions.length > 0) && (
					<div className="item-card-grid-controls">
						{categories.length > 0 && (
							<div className="item-card-grid-filters" role="group" aria-label={filtersLabel}>
								<Pill value={allLabel} active={activeCategory === null} onClick={() => pickCategory(null)} />

								{categories.map((category) => (
									<Pill
										key={category.value}
										value={category.label}
										count={category.count}
										active={activeCategory === category.value}
										onClick={() => pickCategory(category.value)}
									/>
								))}
							</div>
						)}

						<div className="item-card-grid-tools">
							{searchable && (
								<div className="item-card-grid-search">
									<label htmlFor={searchId}>
										<VisuallyHidden value={searchLabel} />
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
								<div className="item-card-grid-sort">
									<span className="item-card-grid-sort-label">{sortLabel}</span>
									<Select
										native
										ariaLabel={sortLabel}
										value={sort ?? ''}
										onValueChange={(value) => {
											setSort(value as SortOption['value']);
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
					<ul className="item-card-grid-list" style={{ '--grid-columns': columns } as React.CSSProperties}>
						{visible.map((item) => {
							return (
								<li key={item.id} className={classNames('item-card-grid-cell', `is-${cardSize}`)}>
									{renderCard(item, variant)}
								</li>
							);
						})}
					</ul>
				) : (
					<Content element="p" size="small" value={emptyMessage} className="item-card-grid-empty" />
				)}

				{pageCount > 1 && (
					<nav className="item-card-grid-pagination" aria-label={paginationLabel}>
						<Interactive
							className="item-card-grid-page-step"
							disabled={safePage === 0}
							onClick={() => setPage((current) => Math.max(0, current - 1))}
						>
							<VisuallyHidden value="Previous page" />
							<Icon name="chevron-left" />
						</Interactive>

						<p className="content item-card-grid-page-status" aria-live="polite">
							{safePage + 1} / {pageCount}
						</p>

						<Interactive
							className="item-card-grid-page-step"
							disabled={safePage >= pageCount - 1}
							onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))}
						>
							<VisuallyHidden value="Next page" />
							<Icon name="chevron-right" />
						</Interactive>
					</nav>
				)}
			</Container>
		</Section>
	);
};

export default ItemCardGrid;
