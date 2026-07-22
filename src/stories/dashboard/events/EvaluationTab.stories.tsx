import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EvaluationTab from '@/components/dashboard/events/EvaluationTab';

const meta: Meta<typeof EvaluationTab> = {
	title: 'Dashboard/Events/EvaluationTab',
	component: EvaluationTab,
	args: { eventId: 'evt-1' },
	parameters: {
		docs: {
			description: {
				component:
					'Read-only shortcut in the event editor: the surveys linked to this convention, each with the status derived from its opens/closes window. Creating and editing them happens in the Enquêtes section, which the button points at.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof EvaluationTab>;

export const Default: Story = {};
