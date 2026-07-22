import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AgendaTab from '@/components/dashboard/events/AgendaTab';

// Mirrors the subjects in .storybook/mocks/fixtures.ts, so the calendar blocks and the swap list
// resolve to names instead of ids.
const PEOPLE: Record<string, string> = {
	'sub-0001': 'Jeffrey de Vries',
	'sub-0002': 'Sanne Bakker',
	'sub-0003': 'Milan Jansen',
	'sub-0004': 'Eva Smit',
};

const meta: Meta<typeof AgendaTab> = {
	title: 'Dashboard/Events/AgendaTab',
	component: AgendaTab,
	args: {
		eventId: 'evt-1',
		sessionUserId: 'usr-0001',
		candidates: Object.entries(PEOPLE).map(([id, display_name]) => ({ id, display_name })),
		subjectName: (id: string | null) => (id ? PEOPLE[id] ?? id : 'Niemand'),
		eventStartsOn: '2026-08-22',
	},
	parameters: {
		docs: {
			description: {
				component:
					'The Agenda tab of the event editor: a drag calendar over the shifts of a convention (create by sweeping, move and resize by dragging, click to open the editor drawer) with the pending swap requests underneath as a `Moment.List` timeline. Saving writes through the Storybook Supabase stand-in, so a change is not persisted between reloads.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof AgendaTab>;

export const Default: Story = {};
