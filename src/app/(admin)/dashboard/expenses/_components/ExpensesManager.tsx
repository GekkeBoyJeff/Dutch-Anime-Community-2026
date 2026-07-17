'use client';

import ExpensesOverview from '@/app/(admin)/dashboard/expenses/_components/ExpensesOverview';
import ExpensesReview from '@/app/(admin)/dashboard/expenses/_components/ExpensesReview';
import MyExpenses from '@/app/(admin)/dashboard/expenses/_components/MyExpenses';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import DetailTabs, { type DetailTab } from '@/components/components/DetailTabs';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';

// Eén route: iedereen met expenses.view ziet "Mijn declaraties"; wie ook expenses.manage heeft krijgt de
// extra "Beheer"-tab. De permissie gate zit al op de sectie (dashboard-sections) én — echt — in RLS.
const ExpensesManager = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard('expenses.view', { className: 'inventory', label: 'Declaraties laden' });

	if (!ready || !session) return fallback;

	const tabs: DetailTab[] = [
		{ label: 'Mijn declaraties', panel: <MyExpenses session={session} /> },
		...(permissions.has('expenses.manage')
			? [
					{ label: 'Beheer', panel: <ExpensesReview session={session} /> },
					{ label: 'Overzicht', panel: <ExpensesOverview /> },
				]
			: []),
	];

	return (
		<Container className="inventory">
			<Title size={2}>Declaraties</Title>
			<DetailTabs label="Declaraties" tabs={tabs} />
		</Container>
	);
};

export default ExpensesManager;
