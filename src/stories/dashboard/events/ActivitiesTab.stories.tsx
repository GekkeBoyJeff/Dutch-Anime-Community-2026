import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ActivitiesTab from '@/components/dashboard/events/ActivitiesTab';

// Mirrors the inventory items and subjects in .storybook/mocks/fixtures.ts.
const PEOPLE: Record<string, string> = {
	'sub-0001': 'Jeffrey de Vries',
	'sub-0002': 'Sanne Bakker',
	'sub-0003': 'Milan Jansen',
	'sub-0004': 'Eva Smit',
};

const meta: Meta<typeof ActivitiesTab> = {
	title: 'Dashboard/Events/ActivitiesTab',
	component: ActivitiesTab,
	args: {
		eventId: 'evt-1',
		sessionUserId: 'usr-0001',
		items: [
			{ id: 'itm-1', name: 'Katana replica' },
			{ id: 'itm-2', name: 'Banner groot' },
			{ id: 'itm-3', name: 'Kassalade' },
		],
		candidates: Object.entries(PEOPLE).map(([id, display_name]) => ({ id, display_name })),
		subjectName: (id: string | null) => (id ? PEOPLE[id] ?? id : '—'),
	},
	parameters: {
		docs: {
			description: {
				component:
					'The Activiteiten tab of the event editor: the hosted activities of a convention in a table, each opening a drawer where its requirements (an inventory item or free text) and its hosts are edited. Requirements and hosts only appear once an activity exists — press "Bewerk" on a row to see them.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof ActivitiesTab>;

export const Default: Story = {};
