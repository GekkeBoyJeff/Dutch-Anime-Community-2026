import { z } from 'zod';

import { Action, Colorset, Heading, Id, Media } from '@/lib/content/schema/primitives';

export const HighlightCardItem = z
	.object({
		id: Id,
		media: Media.optional().describe('5:4 photo shown at the top of the card'),
		badges: z.array(z.string().min(1)).optional().describe('Labels floated over the photo, e.g. "New" or "Popular"'),
		tagline: z.string().optional().describe('Small label rendered above the title'),
		title: z.string().optional().describe('Heading text of the card'),
		text: z.string().optional().describe('Body copy rendered below the title').meta({ editor: 'richtext' }),
		actions: z.array(Action).optional().describe('Row of call-to-action buttons rendered below the text'),
	})
	.meta({ title: 'HighlightCardItem' });
export type HighlightCardItem = z.infer<typeof HighlightCardItem>;

export const HighlightCardsProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster rendered above the card grid'),
		// Grid width; drives the --columns var (responsive cap below).
		columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Number of card columns in the grid'),
		// A highlightCards block with zero cards has no reason to exist; require at least one.
		items: z.array(HighlightCardItem).min(1).describe('Cards rendered in the grid, each with its own running number'),
	})
	.meta({ title: 'HighlightCards' });
export type HighlightCardsProps = z.infer<typeof HighlightCardsProps>;

// Blocks strips `type` (selects the component) and `id` (becomes the React key) before spreading
// the rest as props, so the block schema extends props with those two keys.
export const HighlightCardsBlock = HighlightCardsProps.extend({ type: z.literal('highlightCards'), id: Id.optional() });
export type HighlightCardsBlock = z.infer<typeof HighlightCardsBlock>;
