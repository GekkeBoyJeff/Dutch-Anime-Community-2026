import { useState } from 'react';

import Skeleton from '@/components/basics/Skeleton';
import Table from '@/components/components/Table';

// Column-width by alignment: text columns read wide, numeric/status narrower, so the skeleton reads
// as the same table shape it will become.
const CELL_WIDTH: Record<'start' | 'center' | 'end', string> = { start: '70%', center: '45%', end: '40%' };

const STORE_PREFIX = 'dt-rowcount:';
const MAX_ROWS = 20;

// Last successful row count for a route, so the next visit reserves a realistic table height without a
// fetch. Capped at one page; falls back when there's no history (first visit) or no sessionStorage (SSR).
export const recallRowCount = (key: string, fallback = 6): number => {
	if (typeof sessionStorage === 'undefined') return fallback;
	const raw = sessionStorage.getItem(`${STORE_PREFIX}${key}`);
	const value = raw ? Number(raw) : NaN;
	return Number.isFinite(value) && value > 0 ? Math.min(value, MAX_ROWS) : fallback;
};

export const rememberRowCount = (key: string, count: number): void => {
	if (typeof sessionStorage === 'undefined') return;
	sessionStorage.setItem(`${STORE_PREFIX}${key}`, String(count));
};

interface SkeletonColumn {
	header: string;
	align?: 'start' | 'center' | 'end';
}

interface DataTableSkeletonProps {
	columns: SkeletonColumn[];
	/** Explicit row count; otherwise recalled from `storageKey`/`fallbackRows` */
	rows?: number;
	/** sessionStorage route key to reserve last-known height from */
	storageKey?: string;
	fallbackRows?: number;
}

// Table-shaped loading placeholder: the real headers render immediately (they're static), and each body
// cell is a Skeleton whose width mirrors its column alignment. Sits behind the same `.data-table` frame
// as DataTable so the box matches the loaded table and nothing shifts on arrival.
const DataTableSkeleton = ({ columns, rows, storageKey, fallbackRows = 6 }: DataTableSkeletonProps) => {
	const [count] = useState(() => rows ?? (storageKey ? recallRowCount(storageKey, fallbackRows) : fallbackRows));

	const tableColumns = columns.map((column) => ({ header: column.header, align: column.align }));
	const skeletonRows = Array.from({ length: count }, () =>
		columns.map((column) => <Skeleton key={column.header} width={CELL_WIDTH[column.align ?? 'start']} height="0.9rem" />),
	);

	return (
		<div className="data-table" aria-hidden="true">
			<Table columns={tableColumns} rows={skeletonRows} />
		</div>
	);
};

export default DataTableSkeleton;
