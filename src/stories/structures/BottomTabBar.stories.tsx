import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import BottomTabBar, { type BottomTabBarItem } from '@/components/structures/BottomTabBar';

// Mock items mirroring the shape buildTabBarItems() produces from DASHBOARD_SECTIONS — no Supabase here.
const items: BottomTabBarItem[] = [
	{ key: 'home', label: 'Home', href: '/dashboard', icon: 'home', exact: true },
	{ key: 'my-inventory', label: 'Mijn spullen', href: '/dashboard/my-inventory', icon: 'star' },
	{ key: 'expenses', label: 'Declaraties', href: '/dashboard/expenses', icon: 'file' },
];

const meta: Meta<typeof BottomTabBar> = {
	title: 'Structures/BottomTabBar',
	component: BottomTabBar,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Fixed mobile bottom tab bar for the primary dashboard destinations, hidden at the `l` breakpoint and up (mirroring the MegaMenu overlay switch). "Meer" opens the MegaMenu mobile overlay via a lifted, controlled open state — it does not render its own overlay.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof BottomTabBar>;

export const Default: Story = {
	args: { items },
};

// "Meer" toggling is normally wired to MegaMenu's controlled `open` prop; this story only demos the
// tab's own active/pressed state.
export const WithMore: Story = {
	render: function Render() {
		const [open, setOpen] = useState(false);
		return <BottomTabBar items={items} more={{ label: 'Meer', icon: 'menu', active: open, onClick: () => setOpen((value) => !value) }} />;
	},
};
