import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationsManager from '@/components/dashboard/notifications/NotificationsManager';

const meta: Meta<typeof NotificationsManager> = {
	title: 'Dashboard/Notifications/NotificationsManager',
	component: NotificationsManager,
	globals: { role: 'yakuza' },
	parameters: {
		docs: {
			description: {
				component:
					'One route, three tabs: Versturen (the composer), Historie (what was sent) and Types (the per-type on/off flag). All three require `notifications.send` — **Yakuza** or Beheerder.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof NotificationsManager>;

export const Default: Story = {};
