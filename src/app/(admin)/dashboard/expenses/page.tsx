import type { Metadata } from 'next';

import ExpensesManager from '@/app/(admin)/dashboard/expenses/_components/ExpensesManager';

import '@/app/(admin)/dashboard/inventory.scss';
import '@/app/(admin)/dashboard/expenses/expenses.scss';

export const metadata: Metadata = { title: 'Declaraties', robots: { index: false, follow: false } };

const ExpensesPage = () => <ExpensesManager />;

export default ExpensesPage;
