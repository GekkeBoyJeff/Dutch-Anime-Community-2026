import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DashboardHomeSkeleton from '@/components/dashboard/shell/DashboardHomeSkeleton';

const meta: Meta<typeof DashboardHomeSkeleton> = {
	title: 'Dashboard/Shell/DashboardHomeSkeleton',
	component: DashboardHomeSkeleton,
	parameters: {
		docs: {
			description: {
				component:
					'The hub\'s cold-load placeholder: the same outer boxes the loaded home renders (greeting hero with its next-up card, then the two-column zone grid), so a slow connection sees the shell arriving instead of a bare spinner. It returns a fragment, so it inherits the guard\'s `.dashboard` grid — which is why there is no shift when the real content resolves in. Compare it side by side with Dashboard/Shell/DashboardShell.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="dashboard">
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof DashboardHomeSkeleton>;

export const Default: Story = {};
