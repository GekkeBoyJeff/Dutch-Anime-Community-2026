'use client';

import { useMemo, useState, type ComponentProps, type ReactNode } from 'react';

import Button from '@/components/basics/Button';
import EmptyState from '@/components/components/EmptyState';
import Pagination from '@/components/components/Pagination';
import Table from '@/components/components/Table';
import Select from '@/components/forms/Select';
import { classNames } from '@/lib/classNames';

export type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
	/** Stable key for sort state + React keys */
	key: string;
	/** Plain-text heading; doubles as the mobile data-label, so keep it short */
	header: string;
	/** Cell alignment */
	align?: 'start' | 'center' | 'end';
	/** Make this column sortable; requires `sortValue` */
	sortable?: boolean;
	/** The comparable value used when sorting on this column */
	sortValue?: (row: T) => string | number | null;
	/** Renders the cell */
	cell: (row: T) => ReactNode;
}

type DataTableProps<T> = {
	columns: DataTableColumn<T>[];
	data: T[];
	/** Rows per page; PostgREST caps result sets at 1000, so page well under that. Defaults to 20 */
	pageSize?: number;
	/** Initial sort */
	initialSort?: { key: string; direction: SortDirection };
	/** Shown when `data` is empty */
	empty?: ComponentProps<typeof EmptyState>;
	caption?: string;
	striped?: boolean;
	bordered?: boolean;
	className?: string;
};

// Client-side sortable + paginated wrapper around the (presentational) Table. Sorting is driven by a
// compact control, not clickable headers: on mobile Table hides its <thead> (cells show data-labels),
// so header clicks are unreachable there — a select works on every viewport and keeps Table's headers
// plain strings (a ReactNode header would corrupt the data-label). Renders EmptyState when empty.
// Pass a stable `columns` (memoise it in the consumer) so the sort memo survives unrelated re-renders.
const DataTable = <T,>({
	columns,
	data,
	pageSize = 20,
	initialSort,
	empty,
	caption,
	striped,
	bordered,
	className,
}: DataTableProps<T>) => {
	const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(initialSort ?? null);
	const [page, setPage] = useState(1);
	const [prevData, setPrevData] = useState(data);

	// Reset to the first page when the data set is replaced (e.g. a filter above swaps the rows), so the
	// user isn't stranded on a now-different page 2. React's adjust-state-during-render pattern, not an effect.
	if (data !== prevData) {
		setPrevData(data);
		setPage(1);
	}

	const sortableColumns = columns.filter((column) => column.sortable && column.sortValue);

	const sorted = useMemo(() => {
		if (!sort) return data;
		const column = columns.find((candidate) => candidate.key === sort.key);
		if (!column?.sortValue) return data;
		const { sortValue } = column;
		const factor = sort.direction === 'asc' ? 1 : -1;
		return [...data].sort((a, b) => {
			const av = sortValue(a);
			const bv = sortValue(b);
			if (av === null || av === undefined) return 1;
			if (bv === null || bv === undefined) return -1;
			if (typeof av === 'number' && typeof bv === 'number') return (av - bv) * factor;
			return String(av).localeCompare(String(bv), 'nl') * factor;
		});
	}, [data, sort, columns]);

	const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
	const activePage = Math.min(page, totalPages);
	const visible = sorted.slice((activePage - 1) * pageSize, activePage * pageSize);

	if (data.length === 0 && empty) {
		return <EmptyState {...empty} />;
	}

	const tableColumns = columns.map((column) => ({ header: column.header, align: column.align }));
	const rows: ReactNode[][] = visible.map((row) => columns.map((column) => column.cell(row)));

	return (
		<div className={classNames('data-table', className)}>
			{sortableColumns.length > 0 && (
				<div className="data-table-toolbar">
					<Select
						native
						aria-label="Sorteren op"
						className="data-table-sort"
						value={sort?.key ?? ''}
						options={[
							{ value: '', label: 'Standaardvolgorde' },
							...sortableColumns.map((column) => ({ value: column.key, label: column.header })),
						]}
						onValueChange={(value) => {
							// Reset to the first page in the sort handler (not an effect) so the user lands on
							// top of the new order without a cascading setState-in-effect render.
							setSort(
								value
									? { key: value as string, direction: sort?.key === value ? sort.direction : 'asc' }
									: null,
							);
							setPage(1);
						}}
					/>
					{sort && (
						<Button
							variant="secondary"
							aria-label={sort.direction === 'asc' ? 'Oplopend — wissel naar aflopend' : 'Aflopend — wissel naar oplopend'}
							onClick={() => {
								setSort({ key: sort.key, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
								setPage(1);
							}}
						>
							{sort.direction === 'asc' ? 'Oplopend' : 'Aflopend'}
						</Button>
					)}
				</div>
			)}

			<Table columns={tableColumns} rows={rows} caption={caption} striped={striped} bordered={bordered} />

			{totalPages > 1 && (
				<Pagination
					className="data-table-pagination"
					count={sorted.length}
					pageSize={pageSize}
					page={activePage}
					onPageChange={({ page: next }) => setPage(next)}
					withEdges
				/>
			)}
		</div>
	);
};

export default DataTable;
