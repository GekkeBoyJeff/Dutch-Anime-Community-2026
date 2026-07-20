import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationTypesTable, { type NotificationTypeRow } from '@/components/dashboard/components/NotificationTypesTable';

const rows: NotificationTypeRow[] = [
	{ key: 'handmatige-melding', label: 'Handmatige melding', description: 'Berichten die een crewlid handmatig verstuurt.', enabled: true },
	{ key: 'shift-reminder-30', label: 'Shift-herinnering (30 min)', description: 'Herinnering 30 minuten voor de shift.', enabled: true },
	{ key: 'shift-reminder-5', label: 'Shift-herinnering (5 min)', description: null, enabled: false },
];

const meta: Meta<typeof NotificationTypesTable> = {
	title: 'Dashboard/Components/NotificationTypesTable',
	component: NotificationTypesTable,
	parameters: {
		docs: {
			description: {
				component: 'The notification-type toggle table: label, description and an on/off Switch per type. The caller handles the toggle mutation.',
			},
		},
	},
	args: { onToggle: () => {} },
};

export default meta;

type Story = StoryObj<typeof NotificationTypesTable>;

export const Default: Story = {
	args: { rows, loading: false },
};

export const Loading: Story = {
	args: { rows: null, loading: true },
};

export const Empty: Story = {
	name: 'Leeg',
	args: { rows: [], loading: false },
};
