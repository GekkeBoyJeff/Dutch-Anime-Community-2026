import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/content/schema/primitives';

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

// A chronology on a rail: what happened, what is happening and what is coming, in one list. Where
// eventTeaser announces, this shows rhythm — the past entries are the evidence that there is one.
//
// Past and upcoming are decided when the site is built, not when it is visited, because the export
// bakes its HTML. An entry whose date has slipped by since the last publish therefore still reads as
// upcoming, and a list where nothing is upcoming any more renders as a stopped agenda. Both are
// true statements about a site that has not been republished, and both are meant to be visible:
// hiding them would make a neglected agenda look like a healthy one.
export const MomentListProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the timeline'),
		items: z.array(MomentListItem).min(1).describe('The entries, in the order they should read — oldest first reads as history, newest first as an agenda'),
	})
	.meta({ title: 'MomentList' });
export type MomentListProps = z.infer<typeof MomentListProps>;

// Block = component props plus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const MomentListBlock = MomentListProps.extend({
	type: z.literal('momentList'),
	id: Id.optional(),
});
export type MomentListBlock = z.infer<typeof MomentListBlock>;
