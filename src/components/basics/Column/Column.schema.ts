import type { ReactNode } from 'react';
import { z } from 'zod';

import { breakpoints } from '@/design-system/breakpoints.mjs';

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

const breakpointNames = Object.keys(breakpoints) as (keyof typeof breakpoints)[];

export const ResponsiveSpan = z.union([
	ColumnSpan,
	z.partialRecord(z.enum(['default', ...breakpointNames]), ColumnSpan),
]);
export type ResponsiveSpan = z.infer<typeof ResponsiveSpan>;

export const ColumnProps = z
	.object({
		span: ResponsiveSpan.optional().describe('Columns spanned (1–12): one value for every width, or `{ default, s, m, l, xl, 2xl, 3xl }` where each breakpoint value applies from that width up; full width when omitted'),
		offset: ResponsiveSpan.optional().describe('Empty columns to push the cell by (1–12): one value, or per breakpoint like `span`'),
		children: z.custom<ReactNode>().optional().describe('The column content'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Column' });
export type ColumnProps = z.infer<typeof ColumnProps>;
