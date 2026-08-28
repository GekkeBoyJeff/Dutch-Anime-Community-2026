import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ChannelBoard from '@/components/contentBlocks/ChannelBoard';
import { ChannelBoardProps } from '@/lib/site/content/schema/blocks/channelBoard';

const meta: Meta<typeof ChannelBoard> = {
	title: 'ContentBlocks/ChannelBoard',
	component: ChannelBoard,
	parameters: {
		docs: {
			description: {
				component:
					'The map of the server, readable before you walk in: which room to open, what it is for, and how often something happens there. Channel names are checkable claims — they have to match the server exactly.',
			},
		},
		jsonSchema: { schema: ChannelBoardProps },
	},
};

export default meta;

type Story = StoryObj<typeof ChannelBoard>;

export const Default: Story = {
	args: {
		heading: { tagline: 'De server', title: 'Waar je terechtkomt', intro: 'Vijf kanalen waar het meeste gebeurt.' },
		items: [
			{ id: 'ch1', name: 'welkom', topic: 'hier zeg je hoi', rhythm: 'elke dag' },
			{ id: 'ch2', name: 'shounen', topic: 'one piece, jjk, en alles ernaast', rhythm: 'elke dag' },
			{ id: 'ch3', name: 'art', topic: 'work-in-progress en feedback', rhythm: 'een paar keer per week' },
			{ id: 'ch4', name: 'weerwolven', topic: 'onze eigen async Weerwolven', rhythm: 'elke ronde een week' },
			{ id: 'ch5', name: 'minecraft', topic: 'de server, en wie er bouwt', rhythm: 'doorlopend' },
		],
	},
};
