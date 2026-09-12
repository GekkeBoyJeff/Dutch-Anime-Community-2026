import type { ReactNode } from 'react';
import { z } from 'zod';

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
		children: z.custom<ReactNode>().optional().describe('The column content'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Column' });
export type ColumnProps = z.infer<typeof ColumnProps>;
