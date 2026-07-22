import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationBellWidget from '@/components/dashboard/home/NotificationBell';

const meta: Meta<typeof NotificationBellWidget> = {
	title: 'Dashboard/Home/NotificationBell',
	component: NotificationBellWidget,
	parameters: {
		docs: {
			description: {
				component:
					'The bell in the hero’s top row: a badge with the member’s own unread count, linking to the inbox on /account. It takes no props — it counts `notifications` rows without a `read_at` and hands the number to the tier NotificationBell.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof NotificationBellWidget>;

export const Default: Story = {};
