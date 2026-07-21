import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DiscordProfileCard from '@/components/dashboard/components/DiscordProfileCard';

const meta: Meta<typeof DiscordProfileCard> = {
	title: 'Dashboard/Components/DiscordProfileCard',
	component: DiscordProfileCard,
	parameters: {
		docs: {
			description: {
				component: 'The account page\'s "Discord" section: username/display-name/nick/role-count/joined-at, synced on every login.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxWidth: '28rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof DiscordProfileCard>;

export const Default: Story = {
	args: {
		profile: { username: 'jasmijn', globalName: 'Jasmijn', guildNick: 'Jazz', roleCount: 3, joinedAt: '2023-05-01T00:00:00Z' },
	},
};

export const Loading: Story = {
	args: { profile: null },
};

export const Minimal: Story = {
	name: 'Alleen gebruikersnaam',
	args: {
		profile: { username: 'kevin', globalName: null, guildNick: null, roleCount: 0, joinedAt: null },
	},
};
