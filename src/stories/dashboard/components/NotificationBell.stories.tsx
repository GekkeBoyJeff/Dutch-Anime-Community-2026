import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationBell from '@/components/dashboard/components/NotificationBell';

const meta: Meta<typeof NotificationBell> = {
	title: 'Dashboard/Components/NotificationBell',
	component: NotificationBell,
	parameters: {
		docs: {
			description: {
				component:
					'Unread-notification bell: a bell glyph with a small overflowing count badge (capped at \'9+\'). Zero-CLS — the count slot keeps its size while loading. Presentational; the caller owns the count query (see the dashboard home\'s NotificationBell wrapper).',
			},
		},
	},
	argTypes: {
		count: { control: 'number' },
		loading: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof NotificationBell>;

export const Default: Story = {
	args: {
		count: 3,
		href: '/account',
		label: '3 ongelezen meldingen',
	},
};

export const Loading: Story = {
	...Default,
	args: {
		...Default.args,
		loading: true,
	},
};

export const Zero: Story = {
	...Default,
	args: {
		...Default.args,
		count: 0,
		label: 'Geen ongelezen meldingen',
	},
};

export const Single: Story = {
	...Default,
	args: {
		...Default.args,
		count: 1,
		label: '1 ongelezen melding',
	},
};

export const NinePlusOverflow: Story = {
	name: '9+ overflow',
	args: {
		...Default.args,
		count: 14,
		label: '14 ongelezen meldingen',
	},
};
