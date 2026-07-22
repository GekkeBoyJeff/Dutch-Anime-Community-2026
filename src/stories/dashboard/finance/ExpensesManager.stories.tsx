import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ExpensesManager from '@/components/dashboard/finance/ExpensesManager';

const meta: Meta<typeof ExpensesManager> = {
	title: 'Dashboard/Finance/ExpensesManager',
	component: ExpensesManager,
	parameters: {
		docs: {
			description: {
				component:
					'The `/dashboard/expenses` route: one screen whose tab set follows the caller. Everyone with `expenses.view` gets "Mijn declaraties"; `expenses.manage` adds "Beheer" and "Overzicht". Switch the **Rol** toolbar to Standteam to see the single-tab version.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof ExpensesManager>;

export const Default: Story = {};
