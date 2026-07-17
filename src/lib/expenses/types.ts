export type ExpenseStatus = 'submitted' | 'approved' | 'rejected' | 'reimbursed';

export interface Expense {
	id: string;
	user_id: string;
	event_id: string | null;
	activity_id: string | null;
	description: string;
	amount_eur: number;
	incurred_on: string;
	status: ExpenseStatus;
	receipt_path: string;
	reviewed_by: string | null;
	reviewed_at: string | null;
	review_note: string | null;
	archived_at: string | null;
	created_at: string;
}

// Kwartaal (bv. "2026-Q3") afgeleid van incurred_on (YYYY-MM-DD) — de kwartaalfilter/PDF-groepering rekent hierop.
export const quarterOf = (isoDate: string): string => {
	const [year, month] = isoDate.split('-');
	const q = Math.floor((Number(month) - 1) / 3) + 1;
	return `${year}-Q${q}`;
};

// € 1.234,50 (NL-notatie).
export const formatEur = (amount: number): string =>
	new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
