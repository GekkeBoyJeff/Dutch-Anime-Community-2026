'use client';

import StatusBadge from '@/components/basics/StatusBadge';
import { type Expense, formatEur } from '@/lib/expenses/types';
import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';
import WidgetShell from './WidgetShell';

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
		<WidgetShell
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
						<li key={expense.id} className="widget-row">
							<span className="widget-row-info">
								<span className="widget-row-main">{expense.description}</span>
								<span className="widget-row-sub">
									{formatDate(expense.incurred_on, { dateStyle: 'medium' }) ?? expense.incurred_on} · {formatEur(expense.amount_eur)}
								</span>
							</span>
							<StatusBadge domain="expense" status={expense.status} />
						</li>
					))}
				</ul>
			)}
		</WidgetShell>
	);
};

export default MyExpensesWidget;
