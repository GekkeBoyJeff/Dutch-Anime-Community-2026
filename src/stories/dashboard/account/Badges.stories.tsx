import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Badges from '@/components/dashboard/account/Badges';

const meta: Meta<typeof Badges> = {
	title: 'Dashboard/Account/Badges',
	component: Badges,
	parameters: {
		docs: {
			description: {
				component:
					'The celebratory strip on "Mijn profiel": the badges this member has earned (`my_badges` RPC), capped at six, with thumbnails from the public `badges` bucket. It hides itself entirely until the first badge arrives, so a new member never sees an empty trophy case. The fixture badges carry no image, which is what a badge without an uploaded thumbnail looks like.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof Badges>;

export const Default: Story = {};
