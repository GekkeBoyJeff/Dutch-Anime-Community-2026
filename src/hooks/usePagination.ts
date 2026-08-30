'use client';

import { useCallback, useState } from 'react';

interface UsePaginationOptions {
	totalPages: number;
	page?: number;
	defaultPage?: number;
	siblingCount?: number;
	boundaryCount?: number;
	onPageChange?: (page: number) => void;
}

interface UsePaginationResult {
	pages: (number | 'dots')[];
	active: number;
	setPage: (page: number) => void;
	next: () => void;
	previous: () => void;
	first: () => void;
	last: () => void;
}

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

const buildPages = ({ total, active, siblingCount, boundaryCount }: BuildPagesOptions): (number | 'dots')[] => {
	// The number of items always shown: 2 ellipses, 2 sets of boundary pages, the active page and its
	// two sibling sets.
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

	// A gap of a single page becomes that page, anything wider becomes 'dots'.
	const leftGap: (number | 'dots')[] =
		siblingStart > boundaryCount + 2 ? ['dots'] : range(boundaryCount + 1, Math.min(boundaryCount + 1, siblingStart - 1));
	const rightGap: (number | 'dots')[] =
		siblingEnd < total - boundaryCount - 1
			? ['dots']
			: range(Math.max(siblingEnd + 1, total - boundaryCount), total - boundaryCount);

	return [...startPages, ...leftGap, ...middle, ...rightGap, ...endPages];
};

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
