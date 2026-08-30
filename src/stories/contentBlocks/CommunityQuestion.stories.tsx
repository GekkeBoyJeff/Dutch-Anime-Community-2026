import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CommunityQuestion from '@/components/contentBlocks/CommunityQuestion';
import { CommunityQuestionProps } from '@/lib/site/content/schema/blocks/communityQuestion';

const meta: Meta<typeof CommunityQuestion> = {
	title: 'ContentBlocks/CommunityQuestion',
	component: CommunityQuestion,
	parameters: {
		docs: {
			description: {
				component:
					'A question the community already answered elsewhere, baked in as content. Picking an answer marks which one is yours and reveals how the others answered; nothing is sent or counted. The pick is remembered per question in localStorage.',
			},
		},
		jsonSchema: { schema: CommunityQuestionProps },
	},
};

export default meta;

type Story = StoryObj<typeof CommunityQuestion>;

export const Default: Story = {
	args: {
		question: 'Wat zou jij nu aanzetten?',
		options: [
			{ id: 'q1', label: 'Iets uit het nieuwe seizoen', count: 116 },
			{ id: 'q2', label: 'Een klassieker inhalen', count: 75 },
			{ id: 'q3', label: 'Ik kijk even niks', count: 149 },
		],
		resultLine: 'Zo antwoordden {total} leden op Discord.',
		previousLine: 'Vorige maand won "een klassieker inhalen" nipt.',
	},
};

export const TwoAnswers: Story = {
	args: {
		question: 'Kom je liever online of in het echt langs?',
		options: [
			{ id: 'a', label: 'Online, vanaf de bank', count: 208 },
			{ id: 'b', label: 'In het echt, op een con', count: 132 },
		],
		resultLine: 'Zo antwoordden {total} leden op Discord.',
	},
};
