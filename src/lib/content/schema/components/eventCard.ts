import { z } from 'zod';

import { Media, StatusVariant } from '@/lib/content/schema/primitives';

// Localised strings for the event card's meta labels; each falls back to English in the component
// when omitted.
export const EventCardTranslations = z
	.object({
		timeLabel: z.string().optional().describe('Label for the time meta row; defaults to \'Time\''),
		locationLabel: z.string().optional().describe('Label for the location meta row; defaults to \'Location\''),
	})
	.meta({ title: 'EventCardTranslations' });
export type EventCardTranslations = z.infer<typeof EventCardTranslations>;

// Props for the EventCard component: a standout date chip, title, summary, time range and location,
// plus an optional status badge and lead media.
export const EventCardProps = z
	.object({
		title: z.string().min(1).describe('The event\'s title'),
		summary: z.string().optional().describe('Short summary shown on the card'),
		startDate: z.string().optional().describe('ISO start date/time, validated and formatted SSR-safe'),
		endDate: z.string().optional().describe('ISO end date/time, used to show a time range'),
		location: z.string().optional().describe('Where it happens (venue, city, or \'Online\')'),
		status: z.string().optional().describe('A status chip, e.g. \'Sold out\' or \'Free\''),
		statusVariant: StatusVariant.optional().describe('Status chip variant'),
		media: Media.optional().describe('Lead media (image/video/embed)'),
		href: z.string().optional().describe('Whole-card link to the event'),
		translations: EventCardTranslations.optional().describe('Localised strings for the meta labels; defaults to English'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'EventCard' });
export type EventCardProps = z.infer<typeof EventCardProps>;
