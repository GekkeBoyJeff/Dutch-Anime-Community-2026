import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LatestAnnouncement from '@/components/dashboard/account/LatestAnnouncement';

const meta: Meta<typeof LatestAnnouncement> = {
	title: 'Dashboard/Account/LatestAnnouncement',
	component: LatestAnnouncement,
	parameters: {
		docs: {
			description: {
				component:
					'Ambient "Laatste melding": the single newest notification addressed to the caller, lifted out of the full list so the freshest announcement reads at a glance. Read-only — marking read happens in NotificationsList. An unread item carries the "Nieuw" badge; with nothing to show the panel states you are up to date.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof LatestAnnouncement>;

export const Default: Story = {};
