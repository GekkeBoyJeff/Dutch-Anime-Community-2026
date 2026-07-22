import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationTypes from '@/components/dashboard/notifications/NotificationTypes';

const meta: Meta<typeof NotificationTypes> = {
	title: 'Dashboard/Notifications/NotificationTypes',
	component: NotificationTypes,
	globals: { role: 'yakuza' },
	parameters: {
		docs: {
			description: {
				component:
					'The notification types with one editable flag: enabled. No create or delete — the system knows its types by key, and a disabled type is simply never sent (the shift-reminder scheduler honours the same flag).',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof NotificationTypes>;

export const Default: Story = {};
