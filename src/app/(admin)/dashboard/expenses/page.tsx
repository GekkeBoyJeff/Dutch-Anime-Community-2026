import type { Metadata } from 'next';

import ExpensesManager from '@/components/dashboard/finance/ExpensesManager';

export const metadata: Metadata = { title: 'Declaraties', robots: { index: false, follow: false } };

const ExpensesPage = () => <ExpensesManager />;

export default ExpensesPage;
