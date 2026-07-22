import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FinanceManager from '@/components/dashboard/finance/FinanceManager';

const meta: Meta<typeof FinanceManager> = {
	title: 'Dashboard/Finance/FinanceManager',
	component: FinanceManager,
	parameters: {
		docs: {
			description: {
				component:
					'The org-wide money screen (`expenses.manage`): one flat `finance_rollup()` row set — income, convention costs and declarations — filtered and aggregated in the browser into totals, a spend-per-month area, a spend-per-category bar, a spend-per-convention breakdown and the rollup table. Switch the **Rol** toolbar to Standteam or Auteur to see the guard redirect instead. Income rows carry Bewerk/Verwijder actions; Verwijder only appears with `records.delete` (Beheerder).',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof FinanceManager>;

export const Default: Story = {};
