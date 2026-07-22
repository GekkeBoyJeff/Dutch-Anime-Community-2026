import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CostsTab from '@/components/dashboard/events/CostsTab';

const meta: Meta<typeof CostsTab> = {
	title: 'Dashboard/Events/CostsTab',
	component: CostsTab,
	args: { eventId: 'evt-1', initialBudget: 2500 },
	parameters: {
		docs: {
			description: {
				component:
					'The Kosten tab of the event editor: set the convention budget, then read the declaraties booked against it (spent / pending / remaining). Reading those rows needs `expenses.manage` — switch the **Rol** toolbar to Standteam or Auteur and the table collapses to the budget field with an explanatory notice.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof CostsTab>;

export const Default: Story = {};
