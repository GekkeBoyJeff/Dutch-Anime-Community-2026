'use client';

import StatusBadge from '@/components/basics/StatusBadge';
import DetailRow from '@/components/dashboard/components/DetailRow';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { type Expense, formatEur } from '@/lib/expenses/types';
import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Your most recent declaraties with their status. Same scoped read as MyExpenses (expenses for the
// current user, newest first); RLS also lets managers read all rows, so scope to self explicitly.
const MyExpensesWidget = ({ session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: rows, error: queryError } = await db
			.from('expenses')
			.select('id, description, amount_eur, incurred_on, status')
			.eq('user_id', session.user.id)
			.is('archived_at', null)
			.order('incurred_on', { ascending: false })
			.limit(4);
		if (queryError) throw queryError;
		return (rows ?? []) as Pick<Expense, 'id' | 'description' | 'amount_eur' | 'incurred_on' | 'status'>[];
	});

	return (
		<AsyncCard
			title="Mijn declaraties"
			href="/dashboard/expenses"
			linkLabel="Naar declaraties"
			loading={loading}
			error={error}
			isEmpty={!data || data.length === 0}
			emptyLabel="Nog geen declaraties ingediend."
		>
			{data && data.length > 0 && (
				<ul className="widget-list">
					{data.map((expense) => (
						<DetailRow
							key={expense.id}
							main={expense.description}
							sub={`${formatDate(expense.incurred_on, { dateStyle: 'medium' }) ?? expense.incurred_on} · ${formatEur(expense.amount_eur)}`}
							trailing={<StatusBadge domain="expense" status={expense.status} />}
						/>
					))}
				</ul>
			)}
		</AsyncCard>
	);
};

export default MyExpensesWidget;
