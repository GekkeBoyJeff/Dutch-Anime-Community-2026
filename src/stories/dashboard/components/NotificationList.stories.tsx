import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationList, { type NotificationItem } from '@/components/dashboard/components/NotificationList';

const meta: Meta<typeof NotificationList> = {
	title: 'Dashboard/Components/NotificationList',
	component: NotificationList,
	parameters: {
		docs: {
			description: {
				component:
					'Presentational own-notifications list ("Meldingen"): header with unread count + mark-all, per-row mark-read. Renders nothing once resolved empty. The caller (account NotificationsList) owns the realtime-subscribed query and mutations.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxWidth: '28rem' }}><Story /></div>],
	args: {
		onMarkRead: () => {},
		onMarkAll: () => {},
	},
};

export default meta;

type Story = StoryObj<typeof NotificationList>;

const item = (i: number, overrides: Partial<NotificationItem> = {}): NotificationItem => ({
	id: `n${i}`,
	kind: 'info',
	title: `Melding ${i}`,
	body: i % 2 === 0 ? 'Extra details bij deze melding.' : null,
	read_at: null,
	created_at: '2026-06-01T10:00:00Z',
	...overrides,
});

export const Default: Story = {
	name: 'Default (gemengd gelezen/ongelezen)',
	args: {
		items: [item(1), item(2, { read_at: '2026-06-02T10:00:00Z' }), item(3)],
	},
};

export const Loading: Story = {
	args: { items: null },
};

export const Empty: Story = {
	name: 'Leeg',
	parameters: { docs: { description: { story: 'An empty list renders nothing — the section disappears entirely.' } } },
	args: { items: [] },
};

export const AllRead: Story = {
	name: 'Alles gelezen',
	args: {
		items: [item(1, { read_at: '2026-06-01T11:00:00Z' }), item(2, { read_at: '2026-06-01T12:00:00Z' })],
	},
};

export const Many: Story = {
	name: 'Veel (30)',
	args: {
		items: Array.from({ length: 30 }, (_, i) => item(i + 1, { read_at: i % 3 === 0 ? null : '2026-06-01T10:00:00Z' })),
	},
};
