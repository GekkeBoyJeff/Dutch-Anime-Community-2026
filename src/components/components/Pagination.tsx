'use client';

import type { ReactNode, Ref } from 'react';

import Icon from '@/components/basics/Icon';
import Interactive from '@/components/basics/Interactive';
import VisuallyHidden from '@/components/basics/VisuallyHidden';
import usePagination from '@/hooks/usePagination';
import { classNames } from '@/lib/classNames';
import type {
	PaginationProps as PaginationSchemaProps,
	PaginationTranslations as PaginationTranslationsSchema,
} from '@/lib/content/schema/components/pagination';

export type PaginationTranslations = PaginationTranslationsSchema & {
	/** Builds the accessible name of each page control @default 'Go to page {page}' */
	itemLabel?: (details: { page: number; totalPages: number }) => string;
};

export type PaginationProps = Omit<PaginationSchemaProps, 'translations'> & {
	/** Fires on any page change; payload mirrors the Ark data contract */
	onPageChange?: (details: { page: number; pageSize: number }) => void;
	/** Href builder, only used when type='link' */
	getPageUrl?: (details: { page: number; pageSize: number }) => string;
	/** Localised strings; defaults to English */
	translations?: PaginationTranslations;
};

const DEFAULT_TRANSLATIONS: Required<PaginationTranslations> = {
	rootLabel: 'Pagination',
	prevTriggerLabel: 'Previous page',
	nextTriggerLabel: 'Next page',
	firstTriggerLabel: 'First page',
	lastTriggerLabel: 'Last page',
	itemLabel: ({ page }) => `Go to page ${page}`,
};

// A list of page links/buttons with ellipsis truncation. The range math lives in usePagination; this
// island only wires the active state to onPageChange and renders the default layout. It is a client
// component (useState for the uncontrolled case + onClick) — a parent Server Component drops it in
// where pagination is needed. Mirrors the Ark data contract (count/pageSize/page, payload
// { page, pageSize }) so it stays swappable and pairs with a future Table.
const Pagination = ({
	page,
	defaultPage = 1,
	count,
	pageSize = 10,
	totalPages,
	siblingCount = 1,
	boundaryCount = 1,
	onPageChange,
	type = 'button',
	getPageUrl,
	withControls = true,
	withEdges = false,
	disabled = false,
	translations,
	className,
	ref,
}: PaginationProps & { ref?: Ref<HTMLElement> }) => {
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
		type === 'link' && getPageUrl ? getPageUrl({ page: target, pageSize }) : undefined;

	// A control's onClick is a no-op for links — navigation comes from the href — but still drives the
	// controlled page for button mode and the uncontrolled state either way.
	const goTo = (target: number) => () => setPage(target);

	const renderControl = (key: string, target: number, label: string, glyph: string, isDisabled: boolean) => {
		return (
			<li key={key} className="item">
				<Interactive
					className={classNames('control', `is-${key}`)}
					url={hrefFor(target)}
					disabled={disabled || isDisabled}
					aria-label={label}
					onClick={goTo(target)}
				>
					<Icon name={glyph} className='pagination-icon' />
					<VisuallyHidden>{label}</VisuallyHidden>
				</Interactive>
			</li>
		);
	};

	return (
		<nav ref={ref} className={classNames('pagination', className)} aria-label={t.rootLabel}>
			<ul className="list">
				{withEdges && renderControl('first', 1, t.firstTriggerLabel, 'chevrons-left', active <= 1)}
				{withControls && renderControl('prev', active - 1, t.prevTriggerLabel, 'chevron-left', active <= 1)}

				{pages.map((entry, index) => {
					if (entry === 'dots') {
						return (
							<li key={`dots-${index}`} className="item is-ellipsis" aria-hidden="true">
								<span className="ellipsis">
									<Icon name="dots" />
								</span>
							</li>
						);
					}

					return (
						<li key={entry} className="item">
							<Interactive
								className={classNames('page', entry === active && 'is-active')}
								url={hrefFor(entry)}
								disabled={disabled}
								aria-label={t.itemLabel({ page: entry, totalPages: resolvedTotalPages })}
								aria-current={entry === active ? 'page' : undefined}
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

// Re-export the parts for custom composition alongside the batteries-included default.
export type PaginationEllipsisProps = {
	/** Position key in the list */
	index?: number;
	/** Accessible label announced in place of the glyph */
	label?: string;
	className?: string;
	/** Defaults to a '…' glyph; always aria-hidden with an sr-only label */
	children?: ReactNode;
};

// A non-interactive gap marker for custom layouts. aria-hidden so the glyph is never announced as
// content; the visually-hidden label keeps the meaning available to assistive tech.
export const PaginationEllipsis = ({ label = 'More pages', className, children }: PaginationEllipsisProps) => {
	return (
		<li className={classNames('item', 'is-ellipsis', className)}>
			<span className="ellipsis" aria-hidden="true">
				{children ?? <Icon name="dots" />}
			</span>
			<VisuallyHidden>{label}</VisuallyHidden>
		</li>
	);
};
