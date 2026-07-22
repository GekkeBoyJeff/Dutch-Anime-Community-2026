import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import Button from '@/components/basics/Button';
import PayoutDetailsDrawer from '@/components/dashboard/finance/PayoutDetailsDrawer';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';

// The drawer is controlled by its parent and only fetches once opened, so the story owns the open state
// and starts open. The session comes from the guard, as it does on the declarations screen.
const PayoutDetailsDrawerHost = () => {
	const { ready, fallback, session } = useDashboardGuard('expenses.view', { className: 'inventory', label: 'Laden' });
	const [open, setOpen] = useState(true);
	if (!ready || !session) return fallback;
	return (
		<>
			<Button variant="secondary" onClick={() => setOpen(true)}>
				Uitbetaalgegevens
			</Button>
			<PayoutDetailsDrawer session={session} open={open} onOpenChange={setOpen} />
		</>
	);
};

const meta: Meta<typeof PayoutDetailsDrawer> = {
	title: 'Dashboard/Finance/PayoutDetailsDrawer',
	component: PayoutDetailsDrawer,
	parameters: {
		docs: {
			description: {
				component:
					'"Mijn uitbetaalgegevens": the IBAN and account holder stored once in the tightly scoped `payout_details` table and prefilled into every new declaration. Opens by default in this story; the fields load from the fixture row on open.',
			},
		},
	},
	render: () => <PayoutDetailsDrawerHost />,
};

export default meta;

type Story = StoryObj<typeof PayoutDetailsDrawer>;

export const Default: Story = {};
