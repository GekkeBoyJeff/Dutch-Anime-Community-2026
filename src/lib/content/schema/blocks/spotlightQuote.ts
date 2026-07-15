import { z } from 'zod';

import { Colorset, Id, Media } from '@/lib/content/schema/primitives';

// One oversized quote on a tinted band, with an optional mascot that pops in as a reward moment.
// Deliberately a single quote — social proof reads stronger as one voice than as a carousel.
export const SpotlightQuoteProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the band; defaults to dark'),
		quote: z.string().min(1).describe('The quote text').meta({ editor: 'richtext' }),
		author: z.string().min(1).describe('Who said it, shown under the quote'),
		role: z.string().optional().describe('Context for the author, e.g. \'lid sinds 2021\''),
		mascot: Media.optional().describe('Mascot image shown at the edge of the band'),
	})
	.meta({ title: 'SpotlightQuote' });
export type SpotlightQuoteProps = z.infer<typeof SpotlightQuoteProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const SpotlightQuoteBlock = SpotlightQuoteProps.extend({ type: z.literal('spotlightQuote'), id: Id.optional() });
export type SpotlightQuoteBlock = z.infer<typeof SpotlightQuoteBlock>;
