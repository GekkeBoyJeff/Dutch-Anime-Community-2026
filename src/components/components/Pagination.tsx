'use client';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import usePagination from '@/hooks/usePagination';
import { classNames } from '@/lib/shared/classNames';
import type {
	PaginationEllipsisProps as PaginationEllipsisSchemaProps,
	PaginationProps as PaginationSchemaProps,
	PaginationTranslations as PaginationTranslationsSchema,
} from '@/lib/site/content/schema/components/pagination';

export type PaginationTranslations = PaginationTranslationsSchema;

export type PaginationProps = PaginationSchemaProps;

const DEFAULT_TRANSLATIONS: Required<PaginationTranslations> = {
	rootLabel: 'Pagination',
	prevTriggerLabel: 'Previous page',
	nextTriggerLabel: 'Next page',
	firstTriggerLabel: 'First page',
	lastTriggerLabel: 'Last page',
	itemLabel: 'Go to page {page}',
};

const Pagination = ({
	page,
	defaultPage = 1,
	count,
	pageSize = 10,
	totalPages,
	siblingCount = 1,
	boundaryCount = 1,
	onPageChange,
	variant = 'button',
	getPageUrl,
	withControls = true,
	withEdges = false,
	disabled = false,
	translations,
	className,
}: PaginationProps) => {
	const t = { ...DEFAULT_TRANSLATIONS, ...translations };

	// Ark's contract: count is TOTAL ITEMS, so derive the page count when it (and not totalPages) is given.
	const resolvedTotalPages = totalPages ?? (count !== undefined ? Math.max(1, Math.ceil(count / pageSize)) : 1);

	const { pages, active, setPage, next, previous, first, last } = usePagination({
		totalPages: resolvedTotalPages,
		page,
		defaultPage,
		siblingCount,
		boundaryCount,
		onPageChange: (nextPage) => onPageChange?.({ page: nextPage, pageSize }),
	});

	if (resolvedTotalPages <= 1) {
		return null;
	}

	const hrefFor = (target: number) =>
		variant === 'link' && getPageUrl ? getPageUrl({ page: target, pageSize }) : undefined;

	const goTo = (target: number) => () => setPage(target);

	const itemLabelFor = (target: number) =>
		t.itemLabel.replace('{page}', String(target)).replace('{totalPages}', String(resolvedTotalPages));

	const renderControl = (key: string, target: number, label: string, glyph: string, isDisabled: boolean) => {
		return (
			<li key={key} className="pagination-item">
				<Interactive
					className={classNames('pagination-control', `is-${key}`)}
					url={hrefFor(target)}
					disabled={disabled || isDisabled}
					ariaLabel={label}
					onClick={goTo(target)}
				>
					<Icon name={glyph} className='pagination-icon' />
					<VisuallyHidden value={label} />
				</Interactive>
			</li>
		);
	};

	return (
		<nav className={classNames('pagination', className)} aria-label={t.rootLabel}>
			<ul className="pagination-list">
				{withEdges && renderControl('first', 1, t.firstTriggerLabel, 'chevrons-left', active <= 1)}
				{withControls && renderControl('prev', active - 1, t.prevTriggerLabel, 'chevron-left', active <= 1)}

				{pages.map((entry, index) => {
					if (entry === 'dots') {
						return (
							<li key={`dots-${index}`} className="pagination-item is-ellipsis" aria-hidden="true">
								<span className="pagination-ellipsis">
									<Icon name="dots" />
								</span>
							</li>
						);
					}

					return (
						<li key={entry} className="pagination-item">
							<Interactive
								className={classNames('pagination-page', entry === active && 'is-active')}
								url={hrefFor(entry)}
								disabled={disabled}
								ariaLabel={itemLabelFor(entry)}
								ariaCurrent={entry === active ? 'page' : undefined}
								data-selected={entry === active || undefined}
								onClick={goTo(entry)}
							>
								{entry}
							</Interactive>
						</li>
					);
				})}

				{withControls &&
					renderControl('next', active + 1, t.nextTriggerLabel, 'chevron-right', active >= resolvedTotalPages)}
				{withEdges &&
					renderControl('last', resolvedTotalPages, t.lastTriggerLabel, 'chevrons-right', active >= resolvedTotalPages)}
			</ul>
		</nav>
	);
};

export default Pagination;

export type PaginationEllipsisProps = PaginationEllipsisSchemaProps;

export const PaginationEllipsis = ({
	label = 'More pages',
	className,
	children,
}: PaginationEllipsisProps) => {
	return (
		<li className={classNames('pagination-item', 'is-ellipsis', className)}>
			<span className="pagination-ellipsis" aria-hidden="true">
				{children ?? <Icon name="dots" />}
			</span>
			<VisuallyHidden value={label} />
		</li>
	);
};
