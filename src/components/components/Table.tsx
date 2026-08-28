import parse from 'html-react-parser';

import { classNames } from '@/lib/shared/classNames';
import type { TableProps as TableSchemaProps } from '@/lib/site/content/schema/components/table';

type TableProps = TableSchemaProps;

const Table = ({
	columns,
	rows,
	caption,
	striped = false,
	bordered = false,
	className,
}: TableProps) => {
	return (
		<div className={classNames('table', striped && 'is-striped', bordered && 'is-bordered', className)}>
			<div className="table-scroll">
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
