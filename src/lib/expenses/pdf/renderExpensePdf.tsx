import type { ReportData } from '@/lib/expenses/pdf/ExpenseReport';

// Genereert de declaratie-PDF client-side. @react-pdf/renderer (~471 kB gzip) én het document worden
// UITSLUITEND dynamisch geïmporteerd zodat ze niet in de hoofdbundle van de dashboardroute belanden.
export const renderExpensePdf = async (data: ReportData): Promise<Blob> => {
	const [{ pdf }, { ExpenseReport }] = await Promise.all([import('@react-pdf/renderer'), import('@/lib/expenses/pdf/ExpenseReport')]);
	return pdf(<ExpenseReport data={data} />).toBlob();
};
