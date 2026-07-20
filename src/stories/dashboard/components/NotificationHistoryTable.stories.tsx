import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NotificationHistoryTable, { type NotificationHistoryRow } from '@/components/dashboard/components/NotificationHistoryTable';
import type { Json } from '@/types/database.types';

const typeLabels = new Map([
	['handmatige-melding', 'Handmatige melding'],
	['shift-reminder-30', 'Shift-herinnering'],
]);
const names = new Map([
	['u1', 'Jeffrey'],
	['u2', 'Mila'],
]);

const formatAudience = (audience: Json): string => {
	const a = (audience ?? {}) as Record<string, unknown>;
	const count = typeof a.user_count === 'number' ? a.user_count : null;
	if (a.kind === 'shift-reminder') return 'Shift-herinnering';
	if (a.audience === 'all') return `Alle leden${count !== null ? ` (${count})` : ''}`;
	return count !== null ? `${count} ontvanger${count === 1 ? '' : 's'}` : '—';
};

const rows: NotificationHistoryRow[] = [
	{ id: '1', type_key: 'handmatige-melding', title: 'Programma online', body: 'Het volledige programma staat nu op de site.', sender_user_id: 'u1', audience: { audience: 'all', user_count: 214 }, sent_at: '2026-07-01T10:00:00Z' },
	{ id: '2', type_key: 'shift-reminder-30', title: 'Shift begint zo', body: null, sender_user_id: null, audience: { kind: 'shift-reminder', window_minutes: 30, user_count: 6 }, sent_at: '2026-07-05T08:30:00Z' },
	{
		id: '3',
		type_key: 'handmatige-melding',
		title: 'Bedankt crew',
		body: 'Enorm bedankt aan iedereen die dit weekend heeft geholpen — het was een groot succes en we hebben veel positieve reacties gekregen van bezoekers.',
		sender_user_id: 'u2',
		audience: { user_count: 18 },
		sent_at: '2026-07-06T20:00:00Z',
	},
];

const meta: Meta<typeof NotificationHistoryTable> = {
	title: 'Dashboard/Components/NotificationHistoryTable',
	component: NotificationHistoryTable,
	parameters: {
		docs: {
			description: {
				component:
					'Sent-notification history as a sortable table: date, type, title, a truncated body with a "Bekijk" drawer, sender and the formatted audience. The audience formatter is injected by the caller.',
			},
		},
	},
	args: { typeLabels, names, formatAudience },
};

export default meta;

type Story = StoryObj<typeof NotificationHistoryTable>;

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
