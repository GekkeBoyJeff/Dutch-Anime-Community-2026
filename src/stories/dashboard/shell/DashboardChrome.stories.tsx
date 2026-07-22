import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DashboardChrome from '@/components/dashboard/shell/DashboardChrome';

const meta: Meta<typeof DashboardChrome> = {
	title: 'Dashboard/Shell/DashboardChrome',
	component: DashboardChrome,
	parameters: {
		docs: {
			description: {
				component:
					'The chrome inside AdminShell, mirroring the public SiteChrome: a skip-link, the permission-filtered DashboardNav (mega-menu, command palette and mobile tab bar) and the single `<main id="main">` that skip-link targets, with RouteReveal replaying its entrance fade on every navigation. No footer and no announcement bar — a focused admin surface. It is a server component; DashboardNav is the only client island below it. The child here is a single paragraph so the chrome itself is what you look at.',
			},
		},
	},
	args: {
		children: <p>Hier komt de gerouteerde beheerpagina.</p>,
	},
};

export default meta;

type Story = StoryObj<typeof DashboardChrome>;

export const Default: Story = {};
