import { z } from 'zod';

// One column definition; its order maps 1-to-1 to each row's cells.
export const TableColumn = z
	.object({
		header: z.string().describe('Column heading; may contain HTML'),
		align: z.enum(['start', 'center', 'end']).optional().describe('Optional text alignment for the whole column'),
	})
	.meta({ title: 'TableColumn' });
export type TableColumn = z.infer<typeof TableColumn>;

// Props for the Table component: styled semantic table with a scroll container so wide tables
// never push the page sideways. Each row is narrowed to a plain string per cell since the actual
// prop accepts ReactNode, which is not JSON-expressible; a string cell is parsed as HTML.
export const TableProps = z
	.object({
		columns: z.array(TableColumn).describe('Column definitions; their order maps 1-to-1 to each row\'s cells'),
		rows: z.array(z.array(z.string())).describe('Rows: each is a list of cells (string HTML) matching the columns'),
		caption: z.string().optional().describe('Caption announced to assistive tech and shown above the table'),
		striped: z.boolean().optional().describe('Tints every other body row for easier line tracking; defaults to false'),
		bordered: z.boolean().optional().describe('Draws a divider between every cell, not just the rows; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Table' });
export type TableProps = z.infer<typeof TableProps>;
