import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

export const StatBandItem = z
	.object({
		id: Id,
		value: z.number().describe('The numeric value the counter animates towards'),
		prefix: z.string().optional().describe('Text rendered before the number, e.g. \'€\''),
		suffix: z.string().optional().describe('Text rendered after the number, e.g. \'+\''),
		decimals: z.number().int().min(0).max(2).optional().describe('Number of decimals shown; defaults to 0'),
		label: z.string().min(1).describe('Short description shown under the number'),
	})
	.meta({ title: 'StatBandItem' });
export type StatBandItem = z.infer<typeof StatBandItem>;

// A band of 2-4 key figures that count up when scrolled into view. Numbers are server-rendered at
// their final value, so crawlers and no-JS visitors always see real data.
export const StatBandProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the figures'),
		items: z.array(StatBandItem).min(2).max(4).describe('The key figures rendered in the band'),
	})
	.meta({ title: 'StatBand' });
export type StatBandProps = z.infer<typeof StatBandProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const StatBandBlock = StatBandProps.extend({ type: z.literal('statBand'), id: Id.optional() });
export type StatBandBlock = z.infer<typeof StatBandBlock>;
