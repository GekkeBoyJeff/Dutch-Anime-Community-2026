import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import RouteReveal from '@/components/dashboard/structures/RouteReveal';

const meta: Meta<typeof RouteReveal> = {
	title: 'Dashboard/Structures/RouteReveal',
	component: RouteReveal,
	parameters: {
		docs: {
			description: {
				component:
					'Page-entrance fade-rise, keyed on the pathname so the App Router\'s remount restarts a pure-CSS animation on every navigation (no View Transitions API — that blocks pointer input). ' +
					'Opacity/translate only, so it never shifts layout, and is gated by prefers-reduced-motion. In this story the child is static, since Storybook does not navigate between routes — the animation itself only replays on a real route change (see DashboardChrome).',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof RouteReveal>;

export const Default: Story = {
	args: {
		children: <p>Routed page content.</p>,
	},
};
