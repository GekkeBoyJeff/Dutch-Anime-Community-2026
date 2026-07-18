import type { Metadata } from 'next';

import FinanceManager from '@/app/(admin)/dashboard/finance/_components/FinanceManager';

import '@/app/(admin)/dashboard/inventory.scss';
import '@/app/(admin)/dashboard/finance/finance.scss';

export const metadata: Metadata = { title: 'Financiën', robots: { index: false, follow: false } };

const FinancePage = () => <FinanceManager />;

export default FinancePage;
