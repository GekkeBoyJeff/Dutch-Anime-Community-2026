import type { Metadata } from 'next';

import FinanceManager from '@/components/dashboard/finance/FinanceManager';

export const metadata: Metadata = { title: 'Financiën', robots: { index: false, follow: false } };

const FinancePage = () => <FinanceManager />;

export default FinancePage;
