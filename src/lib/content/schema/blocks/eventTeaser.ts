import { z } from 'zod';

import { EventCardProps } from '@/lib/content/schema/components/eventCard';
import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

// One entry in the teaser list — the content half of an EventCard. Shapes match EventCard's props
// so the block can spread an item straight onto the card.
export const EventTeaserItem = EventCardProps.pick({
	title: true,
	summary: true,
	startDate: true,
	endDate: true,
	location: true,
	status: true,
	statusVariant: true,
	media: true,
	href: true,
	translations: true,
})
	.extend({ id: Id })
	.meta({ title: 'EventTeaserItem' });
export type EventTeaserItem = z.infer<typeof EventTeaserItem>;

// A single-column teaser list: a heading cluster, a dense stack of compact event cards and an
// optional "view all" link. Generalised — nothing here is event-specific beyond the card shape.
export const EventTeaserProps = z
	.object({
		colorset: Colorset.optional().describe('Background color theme of the section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, size, intro) shown above the list'),
		description: z.string().optional().describe('Supporting text shown below the heading').meta({ editor: 'textarea' }),
		// A teaser list with no entries has nothing to show; require at least one.
		events: z.array(EventTeaserItem).min(1).describe('The list of events rendered as compact cards'),
		viewAllUrl: z
			.string()
			.optional()
			.describe('Destination URL for the \'view all\' link; omit to hide the footer link'),
		viewAllLabel: z.string().optional().describe('Visible text for the \'view all\' link'),
	})
	.meta({ title: 'EventTeaser' });
export type EventTeaserProps = z.infer<typeof EventTeaserProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const EventTeaserBlock = EventTeaserProps.extend({ type: z.literal('eventTeaser'), id: Id.optional() });
export type EventTeaserBlock = z.infer<typeof EventTeaserBlock>;
