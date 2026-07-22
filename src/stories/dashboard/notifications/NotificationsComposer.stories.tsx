import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationsComposer from '@/components/dashboard/notifications/NotificationsComposer';

const meta: Meta<typeof NotificationsComposer> = {
	title: 'Dashboard/Notifications/NotificationsComposer',
	component: NotificationsComposer,
	globals: { role: 'yakuza' },
	parameters: {
		docs: {
			description: {
				component:
					'Composes an in-app notification (plus web push) and sends it through the `send-push` Edge Function. The recipients come from `list_notifiable_members()`, not from a direct profiles read — `notifications.send` grants no broad profile access. Sending is stubbed here and always reports success.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof NotificationsComposer>;

export const Default: Story = {};
