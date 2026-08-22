import { z } from 'zod';

import { MarqueeItem } from '@/lib/content/schema/components/marqueeTicker';
import { Colorset, Id } from '@/lib/content/schema/primitives';

// The strip of short facts that carries the claim above it. Wraps MarqueeTicker, so a claim and its
// evidence sit in one block instead of four sections apart.
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
		label: z
			.string()
			.optional()
			.describe('Accessible name for the whole strip, read once by a screen reader; defaults to \'Over de community\''),
	})
	.meta({ title: 'ProofTicker' });
export type ProofTickerProps = z.infer<typeof ProofTickerProps>;

// Block = component props plus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const ProofTickerBlock = ProofTickerProps.extend({
	type: z.literal('proofTicker'),
	id: Id.optional(),
});
export type ProofTickerBlock = z.infer<typeof ProofTickerBlock>;
