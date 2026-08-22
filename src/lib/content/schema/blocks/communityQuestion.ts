import { z } from 'zod';

import { Colorset, Id } from '@/lib/content/schema/primitives';

export const CommunityQuestionOption = z
	.object({
		id: Id,
		label: z.string().min(1).describe('The answer text, at most 40 characters — it shares its row with a percentage'),
		count: z.number().int().min(0).describe('How many people gave this answer in the Discord poll'),
	})
	.meta({ title: 'CommunityQuestionOption' });
export type CommunityQuestionOption = z.infer<typeof CommunityQuestionOption>;

// The question of the month, answered on Discord and baked in here as content. The visitor picks what
// they would have said and sees how the community answered; their pick never leaves their browser.
export const CommunityQuestionProps = z
	.object({
		colorset: Colorset.optional().describe('Light/dark theme applied to the surrounding section'),
		label: z
			.string()
			.optional()
			.describe('Small label above the question naming where the answers come from; defaults to \'Dit vroegen we op Discord.\''),
		question: z
			.string()
			.min(1)
			.describe('The question in the conditional — \'Wat zou jij zeggen?\', never \'Stem mee\'. At most 46 characters'),
		options: z
			.array(CommunityQuestionOption)
			.min(2)
			.max(5)
			.describe('The answers with their counts from the Discord poll'),
		resultLine: z
			.string()
			.min(1)
			.describe('Line below the answers. Use {total} for the summed count, e.g. \'Zo antwoordden {total} leden op Discord.\''),
		previousLine: z
			.string()
			.optional()
			.describe('One line about what the previous question produced; leave empty for the first')
			.meta({ editor: 'textarea' }),
	})
	.meta({ title: 'CommunityQuestion' });
export type CommunityQuestionProps = z.infer<typeof CommunityQuestionProps>;

// Component props = the block minus the keys Blocks strips before spreading (`type` selects the
// component, `id` becomes the React key).
export const CommunityQuestionBlock = CommunityQuestionProps.extend({
	type: z.literal('communityQuestion'),
	id: Id.optional(),
});
export type CommunityQuestionBlock = z.infer<typeof CommunityQuestionBlock>;
