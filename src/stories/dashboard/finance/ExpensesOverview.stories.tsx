import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Container from '@/components/basics/Container';
import ExpensesOverview from '@/components/dashboard/finance/ExpensesOverview';

const meta: Meta<typeof ExpensesOverview> = {
	title: 'Dashboard/Finance/ExpensesOverview',
	component: ExpensesOverview,
	parameters: {
		docs: {
			description: {
				component:
					'The read-only spend aggregation behind the "Overzicht" tab: what DAC spent in total and grouped per convention (with budget and remaining), per year, per quarter and per category. "Besteed" counts approved + reimbursed; submitted shows separately as "in behandeling". Wrapped in the `.inventory` container it mounts in, which carries the tab layout.',
			},
		},
	},
	render: () => (
		<Container className="inventory">
			<ExpensesOverview />
		</Container>
	),
};

export default meta;

type Story = StoryObj<typeof ExpensesOverview>;

export const Default: Story = {};
