import { z } from 'zod';

import { Colorset, Id, Media } from '@/lib/site/content/schema/primitives';

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

export const SpotlightQuoteBlock = SpotlightQuoteProps.extend({ type: z.literal('spotlightQuote'), id: Id.optional() });
export type SpotlightQuoteBlock = z.infer<typeof SpotlightQuoteBlock>;
