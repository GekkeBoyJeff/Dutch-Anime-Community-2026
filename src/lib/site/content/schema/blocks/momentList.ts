import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

export const MomentListItem = z
	.object({
		id: Id,
		date: z
			.string()
			.min(1)
			.describe(
				'ISO date (YYYY-MM-DD). Drives both the marker on the rail and whether the entry reads as past, current or upcoming',
			),
		endDate: z.string().optional().describe('ISO end date for something that runs over several days; without it the entry lasts one day'),
		title: z.string().min(1).describe('What happens or happened'),
		meta: z.string().optional().describe('Supporting line: a time, a place'),
		href: z.string().optional().describe('Destination the entry links to; omit to render it unlinked'),
	})
	.meta({ title: 'MomentListItem' });
export type MomentListItem = z.infer<typeof MomentListItem>;

export const MomentListProps = z
	.object({
		colorset: Colorset.optional(),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the timeline'),
		items: z.array(MomentListItem).min(1).describe('The entries, in the order they should read — oldest first reads as history, newest first as an agenda'),
	})
	.meta({ title: 'MomentList' });
export type MomentListProps = z.infer<typeof MomentListProps>;

export const MomentListBlock = MomentListProps.extend({
	type: z.literal('momentList'),
	id: Id.optional(),
});
export type MomentListBlock = z.infer<typeof MomentListBlock>;
