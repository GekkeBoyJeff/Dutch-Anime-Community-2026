import type { ReactNode } from 'react';
import { z } from 'zod';

export const EntryProps = z
	.object({
		main: z.string().min(1).describe('The row\'s label, on the first line'),
		sub: z.string().optional().describe('Supporting line under the label'),
		marker: z.custom<ReactNode>().optional().describe('Leading decoration shown before the text, hidden from assistive tech'),
		tone: z.enum(['neutral', 'positive', 'warning', 'negative']).optional().describe('Semantic colouring of the row; defaults to \'neutral\''),
		trailing: z.custom<ReactNode>().optional().describe('Content pinned to the end of the row (a value, a badge, an action)'),
		href: z.string().optional().describe('Destination the whole row links to; omit to render it unlinked'),
		loading: z.boolean().optional().describe('Renders skeletons in place of the text while the data loads; defaults to false'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Entry' });
export type EntryProps = z.infer<typeof EntryProps>;

export const EntryListProps = z
	.object({
		items: z.array(EntryProps).describe('The rows to render, in order'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'EntryList' });
export type EntryListProps = z.infer<typeof EntryListProps>;
