import { z } from 'zod';

export const StatClusterItem = z
	.object({
		id: z.union([z.string(), z.number()]),
		value: z.string().min(1).describe('The short anchor, shown large — a number, but a word like \'Gratis\' works too'),
		label: z.string().min(1).describe('What the anchor means, shown small underneath'),
	})
	.meta({ title: 'StatClusterItem' });
export type StatClusterItem = z.infer<typeof StatClusterItem>;

// A row of short facts in two levels: a large anchor with a small label under it. Text, not numbers
// that count up — that is what statBand is for, and it only accepts real numbers.
export const StatClusterProps = z
	.object({
		items: z.array(StatClusterItem).min(2).max(4).describe('Two to four facts; five turns the row into a table'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'StatCluster' });
export type StatClusterProps = z.infer<typeof StatClusterProps>;
