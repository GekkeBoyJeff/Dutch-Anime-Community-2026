import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DashboardNav from '@/components/dashboard/shell/DashboardNav';

const meta: Meta<typeof DashboardNav> = {
	title: 'Dashboard/Shell/DashboardNav',
	component: DashboardNav,
	parameters: {
		docs: {
			description: {
				component:
					'The dashboard\'s own navigation island: the mega-menu wired to the live session (groups filtered by the caller\'s permissions, each with a lazy highlight panel and a live dot or count), the ⌘K command palette that searches conventions and members, and the mobile bottom tab bar sharing the overlay\'s open state. Switch the **Rol** toolbar to see how many groups each role gets — the chip\'s role label does not follow it, since that comes from the caller\'s `user_roles` row. The filtering is UX only — RLS decides what any of these destinations may actually read. While permissions resolve it renders a skeleton bar of the same height, so nothing shifts when the live nav swaps in.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof DashboardNav>;

export const Default: Story = {};
