import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

export const LinkCardItem = z
	.object({
		id: Id,
		url: z.string().min(1).describe('Destination the whole card links to'),
		// Optional leading glyph (the icon font is a placeholder, so it is never required).
		icon: z.string().optional().describe('Name of the optional icon rendered before the title').meta({ editor: 'icon' }),
		title: z.string().min(1).describe('Card heading text'),
		description: z.string().optional().describe('Supporting text rendered below the title'),
		cta: z.string().optional().describe('Call-to-action label rendered beside the trailing arrow'),
	})
	.meta({ title: 'LinkCardItem' });
export type LinkCardItem = z.infer<typeof LinkCardItem>;

export const LinkCardGridProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster rendered above the grid'),
		description: z.string().optional().describe('Fallback intro text used when the heading has none'),
		// Grid width; drives the --link-grid-columns var (responsive cap below).
		columns: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional().describe('Number of columns the card grid renders'),
		// A linkCardGrid with zero links has no reason to exist; require at least one.
		items: z.array(LinkCardItem).min(1).describe('Cards rendered in the grid'),
	})
	.meta({ title: 'LinkCardGrid' });
export type LinkCardGridProps = z.infer<typeof LinkCardGridProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const LinkCardGridBlock = LinkCardGridProps.extend({
	type: z.literal('linkCardGrid'),
	id: Id.optional(),
});
export type LinkCardGridBlock = z.infer<typeof LinkCardGridBlock>;
