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
		span: ResponsiveSpan.optional().describe('How many of the 12 columns the cell takes. One number applies at every screen width; an object such as `{ default: 12, l: 6 }` changes it per breakpoint, each value counting from that width up. Leave it out for full width'),
		offset: ResponsiveSpan.optional().describe('How many empty columns come before the cell, as one number or per breakpoint like `span`'),
		children: z.custom<ReactNode>().optional().describe('The column content'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Column' });
export type ColumnProps = z.infer<typeof ColumnProps>;
