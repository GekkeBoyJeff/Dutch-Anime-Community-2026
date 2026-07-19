export type IncomeCategory = 'donation' | 'sale' | 'sponsorship' | 'other';

// Engelse enum-identifiers → Nederlandse labels voor de UI (spiegelt expenses/types CATEGORY_LABELS).
export const INCOME_CATEGORY_LABELS: Record<IncomeCategory, string> = {
	donation: 'Donatie',
	sale: 'Verkoop',
	sponsorship: 'Sponsoring',
	other: 'Overig',
};
export const INCOME_CATEGORY_OPTIONS = (Object.entries(INCOME_CATEGORY_LABELS) as [IncomeCategory, string][]).map(([value, label]) => ({ value, label }));
export const incomeCategoryLabel = (c: string): string => INCOME_CATEGORY_LABELS[c as IncomeCategory] ?? c;

export interface Income {
	id: string;
	event_id: string | null;
	description: string;
	amount_eur: number;
	category: IncomeCategory;
	received_on: string;
	created_by: string;
	created_at: string;
	updated_at: string;
}
