import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationHistory from '@/components/dashboard/notifications/NotificationHistory';

const meta: Meta<typeof NotificationHistory> = {
	title: 'Dashboard/Notifications/NotificationHistory',
	component: NotificationHistory,
	globals: { role: 'yakuza' },
	parameters: {
		docs: {
			description: {
				component:
					'What was sent, newest first: type label, title, a truncated body with a "Bekijk" drawer, the sender and the audience. The audience is opaque json, so this screen owns the label — manual sends, a whole-guild send and a shift reminder all read differently.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof NotificationHistory>;

export const Default: Story = {};
