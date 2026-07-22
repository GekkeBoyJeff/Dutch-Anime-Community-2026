import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Container from '@/components/basics/Container';
import ExpensesReview from '@/components/dashboard/finance/ExpensesReview';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';

// ExpensesReview is handed the session its parent screen already resolved; the guard supplies the real
// one from the Storybook Supabase stand-in, and gates on the same permission the "Beheer" tab needs.
// The .inventory container is the tab's real mount point — the filter row's layout is scoped to it.
const ExpensesReviewHost = () => {
	const { ready, fallback, session } = useDashboardGuard('expenses.manage', { className: 'inventory', label: 'Declaraties laden' });
	if (!ready || !session) return fallback;
	return (
		<Container className="inventory">
			<ExpensesReview session={session} />
		</Container>
	);
};

const meta: Meta<typeof ExpensesReview> = {
	title: 'Dashboard/Finance/ExpensesReview',
	component: ExpensesReview,
	parameters: {
		docs: {
			description: {
				component:
					'The "Beheer" tab (`expenses.manage`): every declaration, filterable by status, person, convention, quarter and category, with a PDF export of the current selection. The "Uitbetaling" column stacks the IBAN over its account holder. In production your own rows are badged "Eigen declaratie" instead of offering a Beoordeel button; here every row offers one, because the Storybook session carries a role-suffixed user id that no longer equals the fixture\'s `user_id`.',
			},
		},
	},
	render: () => <ExpensesReviewHost />,
};

export default meta;

type Story = StoryObj<typeof ExpensesReview>;

export const Default: Story = {};
