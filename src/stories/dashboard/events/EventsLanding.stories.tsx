import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventsLanding from '@/components/dashboard/events/EventsLanding';

const meta: Meta<typeof EventsLanding> = {
	title: 'Dashboard/Events/EventsLanding',
	component: EventsLanding,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The landing of the "Conventies & events" section: a stat row, upcoming conventions as prominent cards over a compacter grid of past ones, and the way into the tabbed editor. Needs `inventory.manage` — a role without it (Standteam, Auteur) is redirected to /dashboard, which Storybook\'s router mock cannot follow, so the story then stays on the guard\'s spinner. Hard delete is only offered with `records.delete` (Beheerder).',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof EventsLanding>;

export const Default: Story = {};
