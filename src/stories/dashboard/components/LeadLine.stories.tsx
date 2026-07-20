import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LeadLine from '@/components/dashboard/components/LeadLine';

const meta: Meta<typeof LeadLine> = {
	title: 'Dashboard/Components/LeadLine',
	component: LeadLine,
	parameters: {
		docs: {
			description: {
				component: 'A two-line lead: a bold headline with an optional muted sub-line beneath it (a next-up fact, a deep-linked summary). Renders a bare <div> — drop it inside any card body.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof LeadLine>;

export const Default: Story = {
	args: {
		main: 'Volgende conventie',
		sub: 'Animecon · 12 september 2026',
	},
};

export const Long: Story = {
	args: {
		main: 'Za 12 sep · 09:00 – 17:00',
		sub: 'Animecon Nederland · Infobalie · Wisseldienst met twee collega\'s',
	},
};

export const NoSub: Story = {
	name: 'No sub',
	args: {
		main: 'Nog geen shifts toegewezen.',
	},
};
