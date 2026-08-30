import { z } from 'zod';

import { EventCardProps } from '@/lib/site/content/schema/components/eventCard';
import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

export const EventTeaserItem = EventCardProps.pick({
	title: true,
	value: true,
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

export const EventTeaserProps = z
	.object({
		colorset: Colorset.optional().describe('Background color theme of the section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, size, intro) shown above the list'),
		value: z.string().optional().describe('Supporting text shown below the heading').meta({ editor: 'textarea' }),
		events: z.array(EventTeaserItem).min(1).describe('The list of events rendered as compact cards'),
		viewAllUrl: z
			.string()
			.optional()
			.describe('Destination URL for the \'view all\' link; omit to hide the footer link'),
		viewAllLabel: z.string().optional().describe('Visible text for the \'view all\' link'),
	})
	.meta({ title: 'EventTeaser' });
export type EventTeaserProps = z.infer<typeof EventTeaserProps>;

export const EventTeaserBlock = EventTeaserProps.extend({ type: z.literal('eventTeaser'), id: Id.optional() });
export type EventTeaserBlock = z.infer<typeof EventTeaserBlock>;
