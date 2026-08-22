import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ChatPreview from '@/components/contentBlocks/ChatPreview';
import { ChatPreviewProps } from '@/lib/content/schema/blocks/chatPreview';

const meta: Meta<typeof ChatPreview> = {
	title: 'ContentBlocks/ChatPreview',
	component: ChatPreview,
	parameters: {
		docs: {
			description: {
				component:
					'A rebuilt fragment of a conversation, so a visitor can see what walking in looks like instead of being told. Real markup, not a screenshot. The caption is required: names and times without one are a claim that this exchange happened.',
			},
		},
		jsonSchema: { schema: ChatPreviewProps },
	},
};

export default meta;

type Story = StoryObj<typeof ChatPreview>;

export const Default: Story = {
	args: {
		channel: 'welkom',
		messages: [
			{ id: 'c1', author: 'Nour', time: '19:04', text: 'hoi! net binnen, ik kijk vooral shounen' },
			{ id: 'c2', author: 'Hugo', time: '19:06', text: 'hoi Nour, welkom :)' },
			{ id: 'c3', author: 'Jesse', time: '19:10', text: 'oh dan moet je bij #shounen zijn, daar is het altijd druk' },
			{ id: 'c4', author: 'Nour', time: '19:33', text: 'thanks, ga ik doen' },
			{ id: 'c5', author: 'Hugo', time: '19:40', text: 'en als je iets zoekt, roep maar' },
		],
		caption: 'Nagebouwd, met verzonnen namen. Zo loopt het meestal.',
	},
};

export const SamePersonTwice: Story = {
	args: {
		channel: 'welkom',
		messages: [
			{ id: 'd1', author: 'Sam', time: '21:12', text: 'hoi allemaal' },
			{ id: 'd2', author: 'Sam', time: '21:12', text: 'iemand hier die Frieren volgt?' },
			{ id: 'd3', author: 'Yuki', time: '21:19', text: 'ik! net bij aflevering 12' },
		],
		caption: 'Nagebouwd, met verzonnen namen.',
	},
};
