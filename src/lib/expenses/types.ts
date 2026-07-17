export type ExpenseStatus = 'submitted' | 'approved' | 'rejected' | 'reimbursed';
export type ExpenseCategory = 'travel' | 'materials' | 'food' | 'stand' | 'other';

// Engelse enum-identifiers → Nederlandse labels voor de UI/PDF.
export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
	travel: 'Reis',
	materials: 'Materiaal/inkoop',
	food: 'Eten & drinken',
	stand: 'Stand',
	other: 'Overig',
};
export const CATEGORY_OPTIONS = (Object.entries(CATEGORY_LABELS) as [ExpenseCategory, string][]).map(([value, label]) => ({ value, label }));
export const categoryLabel = (c: string): string => CATEGORY_LABELS[c as ExpenseCategory] ?? c;

export const STATUS_LABELS: Record<ExpenseStatus, string> = {
	submitted: 'Ingediend',
	approved: 'Goedgekeurd',
	rejected: 'Afgewezen',
	reimbursed: 'Uitbetaald',
};
export const statusLabel = (s: string): string => STATUS_LABELS[s as ExpenseStatus] ?? s;

export interface Expense {
	id: string;
	user_id: string;
	event_id: string | null;
	activity_id: string | null;
	description: string;
	amount_eur: number;
	incurred_on: string;
	status: ExpenseStatus;
	category: ExpenseCategory;
	receipt_path: string;
	iban: string | null;
	account_holder: string | null;
	reviewed_by: string | null;
	reviewed_at: string | null;
	review_note: string | null;
	archived_at: string | null;
	created_at: string;
}

// "Besteed" telt toegezegd geld: goedgekeurd + uitbetaald (ingediend = in behandeling, apart getoond).
export const isCommittedSpend = (status: ExpenseStatus): boolean => status === 'approved' || status === 'reimbursed';

// Kwartaal (bv. "2026-Q3") afgeleid van incurred_on (YYYY-MM-DD) — de kwartaalfilter/PDF-groepering rekent hierop.
export const quarterOf = (isoDate: string): string => {
	const [year, month] = isoDate.split('-');
	const q = Math.floor((Number(month) - 1) / 3) + 1;
	return `${year}-Q${q}`;
};

// € 1.234,50 (NL-notatie).
export const formatEur = (amount: number): string =>
	new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
