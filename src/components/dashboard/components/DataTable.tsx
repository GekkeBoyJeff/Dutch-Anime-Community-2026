'use client';

import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowData,
	type SortingState,
	useReactTable,
} from '@tanstack/react-table';
import { Fragment, useMemo, useState, type ComponentProps, type ReactNode } from 'react';

import Icon from '@/components/basics/Icon';
import EmptyState from '@/components/components/EmptyState';
import Menu from '@/components/components/Menu';
import Pagination from '@/components/components/Pagination';
import Select from '@/components/forms/Select';
import { classNames } from '@/lib/classNames';

declare module '@tanstack/react-table' {
	interface ColumnMeta<TData extends RowData, TValue> {
		align?: 'start' | 'center' | 'end';
		width?: string;
		label?: string;
	}
}

export type SortDirection = 'asc' | 'desc';

export interface DataTableColumn<T> {
	/** Stable key for sort state, React keys and the mobile data-label */
	key: string;
	/** Plain-text heading; doubles as the mobile data-label, so keep it short */
	header: string;
	/** Cell alignment */
	align?: 'start' | 'center' | 'end';
	/** Make this column sortable; requires `sortValue` */
	sortable?: boolean;
	/** The comparable value used when sorting on this column */
	sortValue?: (row: T) => string | number | null;
	/** Fixed column width (any CSS length), applied via a <colgroup> */
	width?: string;
	/** Renders the cell */
	cell: (row: T) => ReactNode;
}

interface DataTableProps<T> {
	columns: DataTableColumn<T>[];
	data: T[];
	/** Rows per page; PostgREST caps result sets at 1000, so page well under that. Defaults to 20 */
	pageSize?: number;
	/** Initial sort */
	initialSort?: { key: string; direction: SortDirection };
	/** Shown when `data` is empty */
	empty?: ComponentProps<typeof EmptyState>;
	caption?: string;
	/** Marks a row as the active/selected one (drives the selected-row styling) */
	isRowActive?: (row: T) => boolean;
	/** Makes rows clickable; fires with the row on activation */
	onRowActivate?: (row: T) => void;
	/** Renders a right-click / long-press context menu for each row (the same actions as its overflow menu) */
	rowContextMenu?: (row: T) => ReactNode;
	/** Caps the body height and scrolls it, engaging the sticky header */
	maxBodyHeight?: string;
	className?: string;
}

const nullsLastLocale = <T,>(sortValue: (row: T) => string | number | null) => {
	return (rowA: { original: T }, rowB: { original: T }): number => {
		const av = sortValue(rowA.original);
		const bv = sortValue(rowB.original);
		if (av === null || av === undefined) return bv === null || bv === undefined ? 0 : 1;
		if (bv === null || bv === undefined) return -1;
		if (typeof av === 'number' && typeof bv === 'number') return av - bv;
		return String(av).localeCompare(String(bv), 'nl');
	};
};

// Client-side sortable + paginated data table (dashboard tier), wrapping TanStack Table's headless
// core/sorted/pagination row models. It renders its own <table> so it can offer click-sortable sticky
// headers with a direction indicator, hover/selected row states on the admin tokens, and — because the
// header collapses on mobile (cells show their data-label as label/value pairs) — a compact sort select
// that keeps sorting reachable on every viewport. The column def matches the v1 DataTable, so consumers
// only swap the import. Pass a stable `columns` (memoise it) so the table instance stays put.
const DataTable = <T,>({
	columns,
	data,
	pageSize = 20,
	initialSort,
	empty,
	caption,
	isRowActive,
	onRowActivate,
	rowContextMenu,
	maxBodyHeight,
	className,
}: DataTableProps<T>) => {
	const [sorting, setSorting] = useState<SortingState>(initialSort ? [{ id: initialSort.key, desc: initialSort.direction === 'desc' }] : []);

	const tableColumns = useMemo<ColumnDef<T>[]>(
		() =>
			columns.map((column) => ({
				id: column.key,
				accessorFn: column.sortValue ? (row) => column.sortValue!(row) : undefined,
				header: column.header,
				cell: ({ row }) => column.cell(row.original),
				enableSorting: !!(column.sortable && column.sortValue),
				sortingFn: column.sortValue ? nullsLastLocale(column.sortValue) : 'auto',
				sortUndefined: 'last',
				meta: { align: column.align, width: column.width, label: column.header },
			})),
		[columns],
	);

	const table = useReactTable({
		data,
		columns: tableColumns,
		state: { sorting },
		onSortingChange: setSorting,
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		initialState: { pagination: { pageSize } },
		autoResetPageIndex: true,
	});

	const sortableColumns = columns.filter((column) => column.sortable && column.sortValue);
	const activeSort = sorting[0];
	const pageCount = table.getPageCount();
	const rowModel = table.getRowModel();

	if (data.length === 0 && empty) {
		return <EmptyState {...empty} />;
	}

	const alignAttr = (align?: string) => (align && align !== 'start' ? align : undefined);

	return (
		<div className={classNames('data-table-v2', className)}>
			{sortableColumns.length > 0 && (
				<div className="data-table-v2-sortbar">
					<Select
						native
						aria-label="Sorteren op"
						className="data-table-v2-sortselect"
						value={activeSort?.id ?? ''}
						options={[{ value: '', label: 'Standaardvolgorde' }, ...sortableColumns.map((column) => ({ value: column.key, label: column.header }))]}
						onValueChange={(value) => setSorting(value ? [{ id: value as string, desc: activeSort?.id === value ? !!activeSort.desc : false }] : [])}
					/>
					{activeSort && (
						<button
							type="button"
							className="data-table-v2-sortdir"
							aria-label={activeSort.desc ? 'Aflopend — wissel naar oplopend' : 'Oplopend — wissel naar aflopend'}
							onClick={() => setSorting([{ id: activeSort.id, desc: !activeSort.desc }])}
						>
							<Icon name={activeSort.desc ? 'chevron-down' : 'chevron-up'} />
							<span>{activeSort.desc ? 'Aflopend' : 'Oplopend'}</span>
						</button>
					)}
				</div>
			)}

			<div className="data-table-v2-scroll" style={maxBodyHeight ? { maxBlockSize: maxBodyHeight, overflowY: 'auto' } : undefined}>
				<table>
					{caption && <caption>{caption}</caption>}
					<colgroup>
						{columns.map((column) => (
							<col key={column.key} style={column.width ? { inlineSize: column.width } : undefined} />
						))}
					</colgroup>
					<thead>
						<tr>
							{table.getHeaderGroups()[0]?.headers.map((header) => {
								const align = (header.column.columnDef.meta as { align?: string } | undefined)?.align;
								const sortable = header.column.getCanSort();
								const dir = header.column.getIsSorted();
								return (
									<th key={header.id} data-align={alignAttr(align)} aria-sort={dir === 'asc' ? 'ascending' : dir === 'desc' ? 'descending' : undefined}>
										{sortable ? (
											<button type="button" className={classNames('data-table-v2-th', dir && 'is-sorted')} onClick={header.column.getToggleSortingHandler()}>
												<span>{flexRender(header.column.columnDef.header, header.getContext())}</span>
												<Icon className="data-table-v2-sorticon" name={dir === 'asc' ? 'chevron-up' : 'chevron-down'} />
											</button>
										) : (
											flexRender(header.column.columnDef.header, header.getContext())
										)}
									</th>
								);
							})}
						</tr>
					</thead>
					<tbody>
						{rowModel.rows.map((row) => {
							const active = isRowActive?.(row.original) ?? false;
							const rowEl = (
								<tr
									data-selected={active || undefined}
									className={classNames(onRowActivate && 'is-clickable')}
									onClick={onRowActivate ? () => onRowActivate(row.original) : undefined}
								>
									{row.getVisibleCells().map((cell) => {
										const meta = cell.column.columnDef.meta as { align?: string; label?: string } | undefined;
										return (
											<td key={cell.id} data-align={alignAttr(meta?.align)} data-label={meta?.label}>
												{flexRender(cell.column.columnDef.cell, cell.getContext())}
											</td>
										);
									})}
								</tr>
							);
							const menu = rowContextMenu?.(row.original);
							return menu ? (
								<Menu.Context key={row.id} trigger={rowEl} label="Rij-acties">
									{menu}
								</Menu.Context>
							) : (
								<Fragment key={row.id}>{rowEl}</Fragment>
							);
						})}
					</tbody>
				</table>
			</div>

			{pageCount > 1 && (
				<Pagination
					className="data-table-v2-pagination"
					count={table.getFilteredRowModel().rows.length}
					pageSize={pageSize}
					page={table.getState().pagination.pageIndex + 1}
					onPageChange={({ page }) => table.setPageIndex(page - 1)}
					withEdges
				/>
			)}
		</div>
	);
};

export default DataTable;
