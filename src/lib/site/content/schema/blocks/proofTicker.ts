import { z } from 'zod';

import { MarqueeItem } from '@/lib/site/content/schema/components/marqueeTicker';
import { Colorset, Id } from '@/lib/site/content/schema/primitives';

export const ProofTickerProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		items: z
			.array(MarqueeItem)
			.min(2)
			.describe(
				'The short facts that scroll past. Only things that stay true between two builds: \'Sinds 2019\', \'4 cons per jaar\', \'Gratis, altijd\'. Never anything that reads as a live measurement — \'nu online\' is a number nothing here can check',
			),
		direction: z.enum(['left', 'right']).optional().describe('Scroll direction; defaults to \'left\''),
		variant: z.enum(['primary', 'dark', 'light']).optional().describe('Visual treatment of the strip; defaults to \'primary\''),
		ariaLabel: z
			.string()
			.optional()
			.describe('Accessible name for the whole strip, read once by a screen reader; defaults to \'Over de community\''),
	})
	.meta({ title: 'ProofTicker' });
export type ProofTickerProps = z.infer<typeof ProofTickerProps>;

export const ProofTickerBlock = ProofTickerProps.extend({
	type: z.literal('proofTicker'),
	id: Id.optional(),
});
export type ProofTickerBlock = z.infer<typeof ProofTickerBlock>;
