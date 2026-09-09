import { z } from 'zod';

import { CountUpProps } from '@/lib/site/content/schema/basics/countUp';
import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

export const StatBandItem = CountUpProps.pick({ value: true, prefix: true, suffix: true, decimals: true })
	.extend({
		id: Id,
		label: z.string().min(1).describe('Short description shown under the number'),
	})
	.meta({ title: 'StatBandItem' });
export type StatBandItem = z.infer<typeof StatBandItem>;

export const StatBandProps = z
	.object({
		colorset: Colorset.optional(),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the figures'),
		items: z.array(StatBandItem).min(2).max(4).describe('The key figures rendered in the band'),
	})
	.meta({ title: 'StatBand' });
export type StatBandProps = z.infer<typeof StatBandProps>;

export const StatBandBlock = StatBandProps.extend({ type: z.literal('statBand'), id: Id.optional() });
export type StatBandBlock = z.infer<typeof StatBandBlock>;
