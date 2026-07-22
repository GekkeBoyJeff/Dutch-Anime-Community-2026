import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PrepCockpit from '@/components/dashboard/events/PrepCockpit';

const meta: Meta<typeof PrepCockpit> = {
	title: 'Dashboard/Events/PrepCockpit',
	component: PrepCockpit,
	args: {
		eventId: 'evt-1',
		attendanceCount: 3,
		budget: 2500,
		canReadExpenses: true,
	},
	parameters: {
		docs: {
			description: {
				component:
					'The glance that opens the event editor: one clickable stat tile per tab, plus a checklist of what is not arranged yet. Counts come from the Storybook fixtures for Abunai! 2026 — a tile turns amber when it flags something (an unfilled shift, an item without an owner, no tickets). `canReadExpenses` gates the € tile the way `expenses.manage` does in production.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof PrepCockpit>;

export const Default: Story = {};
