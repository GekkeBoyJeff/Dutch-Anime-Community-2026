import { z } from 'zod';

import { Action, Media } from '@/lib/content/schema/primitives';

export const TimelineItem = z
	.object({
		year: z.string().min(1).describe('The headline figure for the milestone, e.g. a year \'2024\''),
		title: z.string().min(1).describe('The milestone title'),
		tagline: z.string().optional().describe('Small label above the title'),
		date: z.string().optional().describe('A precise date line under the title, already formatted for display'),
		text: z.string().optional().describe('Supporting copy; may contain HTML'),
		media: Media.optional().describe('Optional illustrative media for the milestone'),
		actions: z.array(Action).optional().describe('Optional row of actions for the milestone'),
	})
	.meta({ title: 'TimelineItem' });
export type TimelineItem = z.infer<typeof TimelineItem>;

export const TimelineProps = z
	.object({
		items: z.array(TimelineItem).describe('The milestones, oldest-to-newest or newest-to-oldest — rendered in order'),
		align: z
			.enum(['alternating', 'left'])
			.optional()
			.describe('\'alternating\' zig-zags cards left/right of the rail; \'left\' keeps them on one side; defaults to \'alternating\''),
		headingLevel: z
			.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
			.optional()
			.describe('Heading level for each milestone title; defaults to 3'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Timeline' });
export type TimelineProps = z.infer<typeof TimelineProps>;
