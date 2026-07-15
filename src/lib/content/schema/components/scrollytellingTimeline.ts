import { z } from 'zod';

import { Media } from '@/lib/content/schema/primitives';

// One milestone in the scrollytelling story: optional headline figure, title, supporting copy, and
// the media shown in the sticky frame while this milestone is active. Deliberately its own schema
// (not merged with any other timeline item shape) since this component owns the exact field set.
export const ScrollytellingMilestone = z
	.object({
		year: z.string().optional().describe('Optional headline figure, e.g. a year'),
		title: z.string().min(1).describe('The milestone title'),
		description: z.string().optional().describe('Supporting copy; may contain HTML'),
		tagline: z.string().optional().describe('Small label above the title'),
		date: z.string().optional().describe('A precise date line, already formatted for display'),
		media: Media.optional().describe('The media shown in the sticky frame while this milestone is active'),
	})
	.meta({ title: 'ScrollytellingMilestone' });
export type ScrollytellingMilestone = z.infer<typeof ScrollytellingMilestone>;

export const ScrollytellingTimelineProps = z
	.object({
		milestones: z.array(ScrollytellingMilestone).describe('The milestones, in scroll order; each can pin its own media in the frame'),
		ariaLabel: z.string().optional().describe('Accessible label for the whole scrollytelling region; defaults to \'Story timeline\''),
		headingLevel: z
			.union([z.literal(2), z.literal(3), z.literal(4), z.literal(5)])
			.optional()
			.describe('Heading level for each milestone title; defaults to 3'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'ScrollytellingTimeline' });
export type ScrollytellingTimelineProps = z.infer<typeof ScrollytellingTimelineProps>;
