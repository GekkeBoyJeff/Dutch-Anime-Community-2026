import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Container from '@/components/basics/Container';
import MyExpenses from '@/components/dashboard/finance/MyExpenses';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';

// MyExpenses is handed the session its parent screen already resolved. Reusing the guard here — exactly
// as ExpensesManager does — gets the session from the Storybook Supabase stand-in instead of faking one,
// and the .inventory container it mounts in carries the tab's layout.
const MyExpensesHost = () => {
	const { ready, fallback, session } = useDashboardGuard('expenses.view', { className: 'inventory', label: 'Declaraties laden' });
	if (!ready || !session) return fallback;
	return (
		<Container className="inventory">
			<MyExpenses session={session} />
		</Container>
	);
};

const meta: Meta<typeof MyExpenses> = {
	title: 'Dashboard/Finance/MyExpenses',
	component: MyExpenses,
	parameters: {
		docs: {
			description: {
				component:
					'Your own declarations (`expenses.view`, so Standteam sees this too): submit one with a mandatory receipt, edit or withdraw it while it is still "Ingediend", download the receipt and read the reason behind a rejection — that reason renders as the quiet second line under the description. "Uitbetaalgegevens" opens the IBAN drawer that prefills every new declaration.',
			},
		},
	},
	render: () => <MyExpensesHost />,
};

export default meta;

type Story = StoryObj<typeof MyExpenses>;

export const Default: Story = {};
