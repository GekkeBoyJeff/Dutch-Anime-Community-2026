import { z } from 'zod';

import { Colorset, Heading, Id } from '@/lib/site/content/schema/primitives';

export const ChannelBoardItem = z
	.object({
		id: Id,
		name: z
			.string()
			.min(1)
			.describe(
				'Channel name without the # — the block draws that. This is a checkable claim, not a label: a visitor who joins and cannot find it catches us on the most verifiable thing on the page, so it has to match the server exactly',
			),
		topic: z.string().min(1).describe('What the channel is for, in the words a member would use'),
		rhythm: z
			.string()
			.optional()
			.describe('How often something happens there, in words: \'een paar keer per week\'. Not a count of members or messages, and nothing that someone has to keep true every day'),
	})
	.meta({ title: 'ChannelBoardItem' });
export type ChannelBoardItem = z.infer<typeof ChannelBoardItem>;

export const ChannelBoardProps = z
	.object({
		colorset: Colorset.optional(),
		heading: Heading.optional().describe('Heading cluster (tagline, title, intro) shown above the list'),
		items: z.array(ChannelBoardItem).min(2).max(6).describe('Two to six channels; more than six stops being a floor plan and becomes an index'),
	})
	.meta({ title: 'ChannelBoard' });
export type ChannelBoardProps = z.infer<typeof ChannelBoardProps>;

export const ChannelBoardBlock = ChannelBoardProps.extend({
	type: z.literal('channelBoard'),
	id: Id.optional(),
});
export type ChannelBoardBlock = z.infer<typeof ChannelBoardBlock>;
