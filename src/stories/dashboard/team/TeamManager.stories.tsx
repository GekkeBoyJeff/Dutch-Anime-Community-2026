import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TeamManager from '@/components/dashboard/team/TeamManager';

const meta: Meta<typeof TeamManager> = {
	title: 'Dashboard/Team/TeamManager',
	component: TeamManager,
	globals: { role: 'yakuza' },
	parameters: {
		docs: {
			description: {
				component:
					'The convention team as cards — name, role, Discord tag, next shift and open warnings — from a single `staff_overview()` call. Requires `staff.manage`, so it renders under **Yakuza** (or Beheerder); role and permission changes live in Toegangsbeheer, not here.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof TeamManager>;

export const Default: Story = {};
