import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PostTab from '@/components/dashboard/events/PostTab';

// Mirrors the subjects in .storybook/mocks/fixtures.ts.
const PEOPLE: Record<string, string> = {
	'sub-0001': 'Jeffrey de Vries',
	'sub-0002': 'Sanne Bakker',
	'sub-0003': 'Milan Jansen',
};

const meta: Meta<typeof PostTab> = {
	title: 'Dashboard/Events/PostTab',
	component: PostTab,
	args: {
		eventId: 'evt-1',
		sessionUserId: 'usr-0001',
		eventName: 'Abunai! 2026',
		startsOn: '2026-08-22',
		attendance: [
			{ subject_id: 'sub-0001', status: 'present' },
			{ subject_id: 'sub-0002', status: 'signed_up' },
			{ subject_id: 'sub-0003', status: 'late' },
		],
		users: [
			{ id: 'usr-0001', username: 'gekkeboyjeff' },
			{ id: 'usr-0002', username: 'sannebakker' },
		],
		subjectName: (id: string | null) => (id ? PEOPLE[id] ?? id : '—'),
	},
	parameters: {
		docs: {
			description: {
				component:
					'The Post tab of the event editor: one editable thank-you draft per edition. The first version is generated from the event data (who was actually there, who brought material) and is free-form after that. This story loads the existing draft from the fixtures; "Opnieuw genereren" rebuilds it from the props above.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof PostTab>;

export const Default: Story = {};
