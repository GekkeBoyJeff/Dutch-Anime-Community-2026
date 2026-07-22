import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationsList from '@/components/dashboard/account/NotificationsList';

const meta: Meta<typeof NotificationsList> = {
	title: 'Dashboard/Account/NotificationsList',
	component: NotificationsList,
	parameters: {
		docs: {
			description: {
				component:
					'The account-page "Meldingen" section: owns the own-rows query (RLS scopes `notifications` to the caller), the realtime subscription that refetches on every insert or update, and the mark-read mutations. Rendering is delegated to Dashboard/Components/NotificationList — look there for the loading, empty and all-read states.',
			},
		},
	},
	args: {
		// The fixture user; the Supabase stand-in matches its rows on this id.
		userId: 'usr-0001',
	},
};

export default meta;

type Story = StoryObj<typeof NotificationsList>;

export const Default: Story = {};
