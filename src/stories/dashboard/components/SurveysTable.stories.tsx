import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SurveysTable, { type SurveyRow } from '@/components/dashboard/components/SurveysTable';

const now = '2026-07-20T00:00:00Z';

const surveys: SurveyRow[] = [
	{ id: 's1', title: 'Evaluatie DAC 2026', access_mode: 'authenticated', anonymous: false, audience: 'event_attendees', audience_role: null, event_id: 'e1', opens_at: '2026-07-01T00:00:00Z', closes_at: null, archived_at: null },
	{ id: 's2', title: 'Crew-tevredenheid', access_mode: 'authenticated', anonymous: true, audience: 'role', audience_role: 'stand-staff', event_id: null, opens_at: null, closes_at: null, archived_at: null },
	{ id: 's3', title: 'Publieke poll', access_mode: 'public', anonymous: false, audience: 'all_users', audience_role: null, event_id: null, opens_at: '2026-06-01T00:00:00Z', closes_at: '2026-06-15T00:00:00Z', archived_at: null },
];

const noop = () => {};

const meta: Meta<typeof SurveysTable> = {
	title: 'Dashboard/Components/SurveysTable',
	component: SurveysTable,
	parameters: {
		docs: {
			description: {
				component:
					'The surveys overview table: title, access, audience, response count, a derived status badge and per-row status/link/results/edit/archive/delete actions. Status derives from `now`; every action is a callback.',
			},
		},
	},
	args: {
		counts: { s1: 42, s2: 8, s3: 130 },
		now,
		canHardDelete: false,
		empty: { title: 'Geen enquêtes gevonden', description: 'Maak je eerste enquête aan.' },
		onSetOpen: noop,
		onCopyLink: noop,
		onResults: noop,
		onEdit: noop,
		onSetArchived: noop,
		onDelete: noop,
	},
};

export default meta;

type Story = StoryObj<typeof SurveysTable>;

export const Default: Story = {
	args: { surveys },
};

export const WithHardDelete: Story = {
	name: 'Met verwijderrecht',
	args: { surveys, canHardDelete: true },
};

export const Empty: Story = {
	name: 'Leeg',
	args: { surveys: [] },
};
