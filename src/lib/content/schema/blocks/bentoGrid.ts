import { z } from 'zod';

import { Action, Colorset, Heading, Id, Media } from '@/lib/content/schema/primitives';

// How much of the grid a tile claims. `feature` spans two columns and two rows, `wide` two columns,
// `tall` two rows, `standard` one cell.
export const BentoSpan = z.enum(['standard', 'wide', 'tall', 'feature']);
export type BentoSpan = z.infer<typeof BentoSpan>;

// Surface tint for a tile. Mapped to colorset/accent tokens in SCSS (never a hardcoded colour).
export const BentoSurface = z.enum(['default', 'muted', 'accent', 'inverse']);
export type BentoSurface = z.infer<typeof BentoSurface>;

export const BentoItem = z
	.object({
		id: Id,
		span: BentoSpan.optional().describe('How many columns/rows the tile spans in the grid'),
		surface: BentoSurface.optional().describe('Tint applied to the tile background'),
		tagline: z.string().optional().describe('Small label shown above the tile title'),
		title: z.string().optional().describe('Tile heading text'),
		body: z.string().optional().describe('Supporting paragraph text of the tile').meta({ editor: 'richtext' }),
		media: Media.optional().describe('Image, video or embed shown in the tile'),
		// A trailing call-to-action; `cta` is its label, `url` makes the whole tile a link.
		cta: Action.optional().describe('Call-to-action text and icon shown at the end of the tile'),
		url: z.string().optional().describe('Destination that makes the whole tile a clickable link'),
	})
	.meta({ title: 'BentoItem' });
export type BentoItem = z.infer<typeof BentoItem>;

export const BentoGridProps = z
	.object({
		colorset: Colorset.optional().describe('Light or dark theme applied to the section'),
		heading: Heading.optional().describe('Tagline, title and intro shown above the grid'),
		description: z.string().optional().describe('Fallback intro text shown when heading.intro is not set').meta({ editor: 'textarea' }),
		// Base column count; drives the --bento-columns var (responsive cap below).
		columns: z.union([z.literal(3), z.literal(4), z.literal(5), z.literal(6)]).optional().describe('Number of columns in the grid'),
		// A bentoGrid with zero tiles has no reason to exist; require at least one.
		items: z.array(BentoItem).min(1).describe('Tiles rendered in the grid'),
	})
	.meta({ title: 'BentoGrid' });
export type BentoGridProps = z.infer<typeof BentoGridProps>;

// Block = the props plus the keys Blocks strips before spreading (`type` selects the component,
// `id` becomes the React key).
export const BentoGridBlock = BentoGridProps.extend({ type: z.literal('bentoGrid'), id: Id.optional() });
export type BentoGridBlock = z.infer<typeof BentoGridBlock>;
