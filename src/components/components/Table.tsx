import parse from 'html-react-parser';
import type { ReactNode, Ref } from 'react';

import { classNames } from '@/lib/classNames';
import type { TableProps as TableSchemaProps } from '@/lib/content/schema/components/table';

type TableProps = Omit<TableSchemaProps, 'rows'> & {
	/** Rows: each is a list of cells (string HTML or ReactNode) matching the columns */
	rows: ReactNode[][];
};

// Styled semantic table with a scroll container so wide tables never push the page sideways. The
// responsive-table primitive PricingComparison and ComparisonTable reuse; the sortable DataTable
// (TanStack) stays an opt-in client feature, not this default. A string cell is parsed as HTML. Each
// cell carries its column header as data-label so the mobile stacked layout can show it as a
// CSS pseudo-element, letting a row read as label/value pairs once the columns collapse.
const Table = ({
	columns,
	rows,
	caption,
	striped = false,
	bordered = false,
	className,
	ref,
}: TableProps & { ref?: Ref<HTMLDivElement> }) => {
	return (
		<div ref={ref} className={classNames('table', striped && 'is-striped', bordered && 'is-bordered', className)}>
			<div className="scroll">
				<table>
					{caption && <caption>{caption}</caption>}
					<thead>
						<tr>
							{columns.map((column, index) => (
								<th key={index} scope="col" data-align={column.align}>
									{typeof column.header === 'string' ? parse(column.header) : column.header}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{rows.map((cells, rowIndex) => (
							<tr key={rowIndex}>
								{cells.map((cell, cellIndex) => (
									<td key={cellIndex} data-align={columns[cellIndex]?.align} data-label={columns[cellIndex]?.header}>
										{typeof cell === 'string' ? parse(cell) : cell}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
};

export default Table;
