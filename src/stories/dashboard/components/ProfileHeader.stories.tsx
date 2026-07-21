import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProfileHeader from '@/components/dashboard/components/ProfileHeader';

const meta: Meta<typeof ProfileHeader> = {
	title: 'Dashboard/Components/ProfileHeader',
	component: ProfileHeader,
	parameters: {
		docs: {
			description: {
				component: 'The account page\'s identity strip: avatar, display name, and a small meta row (Discord id + role badge).',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof ProfileHeader>;

export const Default: Story = {
	args: {
		name: 'Jasmijn de Vries',
		role: 'stand-staff',
		discordId: '123456789012345678',
	},
};

export const WithAvatar: Story = {
	name: 'Met avatar',
	args: {
		...Default.args,
		avatarUrl: 'https://picsum.photos/seed/dac-profile-header/128/128',
	},
};

export const NoRole: Story = {
	name: 'Zonder rol',
	args: {
		name: 'Kevin Jansen',
	},
};
