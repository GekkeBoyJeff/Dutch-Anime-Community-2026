import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DashboardShell from '@/components/dashboard/shell/DashboardShell';

const meta: Meta<typeof DashboardShell> = {
	title: 'Dashboard/Shell/DashboardShell',
	component: DashboardShell,
	parameters: {
		docs: {
			description: {
				component:
					'The staff hub. Which widgets appear depends entirely on the caller’s permissions — switch the **Rol** toolbar to see the same screen as a stand-staff volunteer, a yakuza organiser, an author or an admin. The data comes from the Storybook fixtures, not from Supabase.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof DashboardShell>;

export const Default: Story = {};
