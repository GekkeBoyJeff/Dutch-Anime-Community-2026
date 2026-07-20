'use client';

import DetailRow from '@/components/dashboard/components/DetailRow';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { formatEur } from '@/lib/expenses/types';
import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Declaraties awaiting review, for expenses managers. Mirrors ExpensesReview's read (all submitted,
// non-archived) but trimmed to a count + the oldest few, deep-linking to the Beheer tab.
const PendingReviewsWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db
			.from('expenses')
			.select('id, description, amount_eur, incurred_on')
			.eq('status', 'submitted')
			.is('archived_at', null)
			.order('incurred_on', { ascending: true });
		if (queryError) throw queryError;
		return rows ?? [];
	});

	const total = data?.length ?? 0;

	return (
		<AsyncCard
			title={total > 0 ? `Te beoordelen (${total})` : 'Te beoordelen'}
			href="/dashboard/expenses"
			linkLabel="Naar declaratie-beheer"
			loading={loading}
			error={error}
			isEmpty={total === 0}
			hideWhenEmpty
		>
			{data && total > 0 && (
				<ul className="widget-list">
					{data.slice(0, 4).map((expense) => (
						<DetailRow
							key={expense.id}
							main={expense.description}
							sub={formatDate(expense.incurred_on, { dateStyle: 'medium' }) ?? expense.incurred_on}
							trailing={<span className="detail-row-amount">{formatEur(expense.amount_eur)}</span>}
						/>
					))}
				</ul>
			)}
		</AsyncCard>
	);
};

export default PendingReviewsWidget;
