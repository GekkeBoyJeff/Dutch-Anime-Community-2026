import Title from '@/components/basics/Title';
import { formatEur } from '@/lib/expenses/types';

export interface BarRow {
	label: string;
	amount: number;
}

type Props = { title: string; rows: BarRow[]; emptyLabel: string };

// Route-local CSS-token bar breakdown: labeled rows with a proportional bar + euro amount, widest = the
// group with the most spend. No chart library. Finance-specific (single consumer, admin-only), so it
// lives beside the page rather than in the schema-driven tier — see the task report for the rationale.
const BarBreakdown = ({ title, rows, emptyLabel }: Props) => {
	const max = rows.reduce((m, r) => Math.max(m, r.amount), 0);

	return (
		<section className="finance-breakdown">
			<Title element="h3" size={5}>{title}</Title>
			{rows.length === 0 ? (
				<p className="finance-breakdown-empty">{emptyLabel}</p>
			) : (
				<ul className="finance-bars">
					{rows.map((row) => (
						<li key={row.label} className="finance-bar">
							<span className="finance-bar-label">{row.label}</span>
							<span className="finance-bar-track">
								<span className="finance-bar-fill" style={{ inlineSize: `${max > 0 ? (row.amount / max) * 100 : 0}%` }} />
							</span>
							<span className="finance-bar-amount">{formatEur(row.amount)}</span>
						</li>
					))}
				</ul>
			)}
		</section>
	);
};

export default BarBreakdown;
