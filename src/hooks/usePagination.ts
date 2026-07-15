'use client';

import { useCallback, useState } from 'react';

export interface UsePaginationOptions {
	/** Total page count (required) */
	totalPages: number;
	/** Controlled active page (1-based); pairs with onPageChange */
	page?: number;
	/** Uncontrolled initial page when `page` is omitted @default 1 */
	defaultPage?: number;
	/** Pages shown either side of the active page @default 1 */
	siblingCount?: number;
	/** Pages pinned at each end @default 1 */
	boundaryCount?: number;
	/** Fires with the next page whenever it changes */
	onPageChange?: (page: number) => void;
}

export interface UsePaginationResult {
	/** The visible page list; 'dots' is the ellipsis gap sentinel */
	pages: (number | 'dots')[];
	/** The current active page (1-based) */
	active: number;
	/** Jump to a page (clamped to 1..totalPages) */
	setPage: (page: number) => void;
	/** Go to the next page (no-op on the last page) */
	next: () => void;
	/** Go to the previous page (no-op on the first page) */
	previous: () => void;
	/** Jump to the first page */
	first: () => void;
	/** Jump to the last page */
	last: () => void;
}

// Builds an inclusive [start, end] integer range.
const range = (start: number, end: number): number[] => {
	const length = Math.max(0, end - start + 1);
	return Array.from({ length }, (_, index) => start + index);
};

interface BuildPagesOptions {
	total: number;
	active: number;
	siblingCount: number;
	boundaryCount: number;
}

// The ellipsis algorithm: always show the boundary pages at each end plus a sibling window around
// the active page, and replace each remaining gap with a single 'dots' marker. When everything fits
// (gaps are 0 or 1 page wide) the dots collapse to the real page so the run stays contiguous.
const buildPages = ({ total, active, siblingCount, boundaryCount }: BuildPagesOptions): (number | 'dots')[] => {
	// The number of items always shown: 2 ellipses, 2 sets of boundary pages, the active page and its
	// two sibling sets. If the total is smaller, just list every page.
	const totalSlots = siblingCount * 2 + boundaryCount * 2 + 3;
	if (total <= totalSlots) {
		return range(1, total);
	}

	const startPages = range(1, boundaryCount);
	const endPages = range(total - boundaryCount + 1, total);

	const siblingStart = Math.max(
		Math.min(active - siblingCount, total - boundaryCount - siblingCount * 2 - 1),
		boundaryCount + 2,
	);
	const siblingEnd = Math.min(
		Math.max(active + siblingCount, boundaryCount + siblingCount * 2 + 2),
		endPages.length > 0 ? (endPages[0] as number) - 2 : total - 1,
	);

	const middle = range(siblingStart, siblingEnd);

	// Left gap: a single page becomes that page, anything wider becomes 'dots'.
	const leftGap: (number | 'dots')[] =
		siblingStart > boundaryCount + 2 ? ['dots'] : range(boundaryCount + 1, Math.min(boundaryCount + 1, siblingStart - 1));
	const rightGap: (number | 'dots')[] =
		siblingEnd < total - boundaryCount - 1
			? ['dots']
			: range(Math.max(siblingEnd + 1, total - boundaryCount), total - boundaryCount);

	return [...startPages, ...leftGap, ...middle, ...rightGap, ...endPages];
};

// Pure page-range computation with ellipsis truncation (Mantine's proven shape, 'dots' sentinel).
// No DOM and no client APIs beyond the controlled/uncontrolled state — a single source of truth for
// the page list, the active page and the navigation actions that Pagination renders.
const usePagination = ({
	totalPages,
	page,
	defaultPage = 1,
	siblingCount = 1,
	boundaryCount = 1,
	onPageChange,
}: UsePaginationOptions): UsePaginationResult => {
	const total = Math.max(1, totalPages);
	const [uncontrolled, setUncontrolled] = useState(defaultPage);

	// Controlled when a page prop is passed, mirroring Interactive's value/defaultValue split.
	const isControlled = page !== undefined;
	const active = Math.min(total, Math.max(1, isControlled ? page : uncontrolled));

	const setPage = useCallback(
		(next: number) => {
			const clamped = Math.min(total, Math.max(1, next));
			if (!isControlled) {
				setUncontrolled(clamped);
			}
			onPageChange?.(clamped);
		},
		[total, isControlled, onPageChange],
	);

	const next = useCallback(() => setPage(active + 1), [setPage, active]);
	const previous = useCallback(() => setPage(active - 1), [setPage, active]);
	const first = useCallback(() => setPage(1), [setPage]);
	const last = useCallback(() => setPage(total), [setPage, total]);

	const pages = buildPages({ total, active, siblingCount, boundaryCount });

	return { pages, active, setPage, next, previous, first, last };
};

export default usePagination;
