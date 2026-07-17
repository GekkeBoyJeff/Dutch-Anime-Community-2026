import type { ReportData } from '@/lib/expenses/pdf/ExpenseReport';

// Het DAC-logo (same-origin, dus toegestaan door de CSP) als data-URI ophalen — betrouwbaarder dan react-pdf
// een relatieve URL laten fetchen. Best-effort: mislukt het, dan valt de PDF terug op geen logo.
const fetchLogoDataUri = async (): Promise<string | undefined> => {
	try {
		const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
		const res = await fetch(`${base}/media/dac-logo.png`);
		if (!res.ok) return undefined;
		const blob = await res.blob();
		return await new Promise<string>((resolve, reject) => {
			const reader = new FileReader();
			reader.onloadend = () => resolve(reader.result as string);
			reader.onerror = reject;
			reader.readAsDataURL(blob);
		});
	} catch {
		return undefined;
	}
};

// Genereert de declaratie-PDF client-side. @react-pdf/renderer (~471 kB gzip) én het document worden
// UITSLUITEND dynamisch geïmporteerd zodat ze niet in de hoofdbundle van de dashboardroute belanden.
export const renderExpensePdf = async (data: ReportData): Promise<Blob> => {
	const [{ pdf }, { ExpenseReport }, logoDataUri] = await Promise.all([
		import('@react-pdf/renderer'),
		import('@/lib/expenses/pdf/ExpenseReport'),
		fetchLogoDataUri(),
	]);
	return pdf(<ExpenseReport data={data} logoDataUri={logoDataUri} />).toBlob();
};
