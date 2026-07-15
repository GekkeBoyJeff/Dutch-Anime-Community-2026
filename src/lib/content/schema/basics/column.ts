import { z } from 'zod';

// Mirrors the component's `Span` literal union (1-12) so the panel shows the exact allowed values.
export const ColumnSpan = z.union([
	z.literal(1),
	z.literal(2),
	z.literal(3),
	z.literal(4),
	z.literal(5),
	z.literal(6),
	z.literal(7),
	z.literal(8),
	z.literal(9),
	z.literal(10),
	z.literal(11),
	z.literal(12),
]);
export type ColumnSpan = z.infer<typeof ColumnSpan>;

// A single cell of the 12-column grid. Each prop maps to a generated `is-{n}` / `is-{n}-{bp}` (span)
// or `offset-{n}` / `offset-{n}-{bp}` (offset) class; omit `span` for an equal-width auto cell.
export const ColumnProps = z
	.object({
		span: ColumnSpan.optional().describe('Columns spanned (1–12) at the base width'),
		spanM: ColumnSpan.optional().describe('Span from the m breakpoint up'),
		spanL: ColumnSpan.optional().describe('Span from the l breakpoint up'),
		spanXl: ColumnSpan.optional().describe('Span from the xl breakpoint up'),
		offset: ColumnSpan.optional().describe('Empty columns to push the cell by (1–12)'),
		offsetM: ColumnSpan.optional().describe('Offset from the m breakpoint up'),
		offsetL: ColumnSpan.optional().describe('Offset from the l breakpoint up'),
		offsetXl: ColumnSpan.optional().describe('Offset from the xl breakpoint up'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Column' });
export type ColumnProps = z.infer<typeof ColumnProps>;
