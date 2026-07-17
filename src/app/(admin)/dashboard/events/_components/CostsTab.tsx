'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Field from '@/components/forms/Field';
import TextInput from '@/components/forms/TextInput';
import { usePermissions } from '@/lib/auth/permissions';
import { categoryLabel, type Expense, formatEur, isCommittedSpend } from '@/lib/expenses/types';
import { formatDate } from '@/lib/formatDate';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { eventId: string; initialBudget: number | null; onBudgetSaved: (budget: number | null) => void };

// "Kosten"-tab op de conventie (EventEditor, inventory.manage): budget instellen + de gekoppelde declaraties
// met besteed (goedgekeurd + uitbetaald) / in behandeling (ingediend) / resterend. De declaraties zelf lezen
// vereist expenses.manage (RLS); een manager zonder dat recht ziet enkel het budgetveld.
const CostsTab = ({ eventId, initialBudget, onBudgetSaved }: Props) => {
	const toast = Toast.useToastManager();
	const { permissions } = usePermissions();
	const canReadExpenses = permissions.has('expenses.manage');
	const [budget, setBudget] = useState(initialBudget !== null ? String(initialBudget) : '');
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [people, setPeople] = useState<Map<string, string>>(new Map());
	const [refreshKey, setRefreshKey] = useState(0);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		if (!canReadExpenses) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('expenses').select('*').eq('event_id', eventId).is('archived_at', null).order('incurred_on', { ascending: false }),
			db.from('profiles').select('id, username'),
		]).then((res) => {
			if (!active) return;
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon kosten niet laden', description: failed.message, type: 'error' });
				return;
			}
			const [{ data: rows }, { data: profileRows }] = res;
			setExpenses((rows ?? []) as Expense[]);
			setPeople(new Map((profileRows ?? []).map((p) => [p.id as string, p.username as string])));
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [eventId, refreshKey, canReadExpenses]);

	const totals = useMemo(() => {
		let committed = 0;
		let pending = 0;
		for (const e of expenses) {
			if (isCommittedSpend(e.status)) committed += Number(e.amount_eur);
			else if (e.status === 'submitted') pending += Number(e.amount_eur);
		}
		return { committed, pending };
	}, [expenses]);

	const remaining = initialBudget !== null ? initialBudget - totals.committed : null;
	const overBudget = remaining !== null && remaining < 0;
	const personName = (id: string): string => people.get(id) ?? id.slice(0, 8);

	const saveBudget = async () => {
		const trimmed = budget.trim();
		const val = trimmed === '' ? null : Number(trimmed.replace(',', '.'));
		if (val !== null && !(val >= 0)) {
			toast.add({ title: 'Budget moet 0 of hoger zijn (leeg = geen budget).', type: 'error' });
			return;
		}
		setBusy(true);
		try {
			const { error } = await getBrowserClient().from('events').update({ budget_eur: val }).eq('id', eventId);
			if (error) {
				toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
				return;
			}
			onBudgetSaved(val);
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Budget opgeslagen', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const columns: DataTableColumn<Expense>[] = useMemo(
		() => [
			{ key: 'person', header: 'Wie', sortable: true, sortValue: (e) => personName(e.user_id), cell: (e) => personName(e.user_id) },
			{ key: 'description', header: 'Omschrijving', cell: (e) => e.description },
			{ key: 'category', header: 'Categorie', cell: (e) => categoryLabel(e.category) },
			{ key: 'date', header: 'Datum', align: 'center', sortable: true, sortValue: (e) => e.incurred_on, cell: (e) => formatDate(e.incurred_on, { dateStyle: 'medium' }) ?? e.incurred_on },
			{ key: 'amount', header: 'Bedrag', align: 'end', sortable: true, sortValue: (e) => Number(e.amount_eur), cell: (e) => formatEur(e.amount_eur) },
			{ key: 'status', header: 'Status', align: 'center', cell: (e) => <StatusBadge domain="expense" status={e.status} /> },
		],
		[people],
	);

	return (
		<div className="inventory-tab">
			<div className="inventory-form">
				<Field name="budget">
					<Field.Label>Budget voor deze conventie (€)</Field.Label>
					<div className="inventory-row-actions">
						<TextInput type="number" inputMode="decimal" value={budget} onChange={(e) => setBudget(e.currentTarget.value)} placeholder="Leeg = geen budget" />
						<Button variant="primary" onClick={saveBudget} disabled={busy}>
							{busy ? 'Bezig…' : 'Opslaan'}
						</Button>
					</div>
				</Field>
			</div>

			{canReadExpenses ? (
				<>
					<ul className="con-list expenses-budget">
						<li className="con-line">
							<span className="con-line-main">Besteed (goedgekeurd + uitbetaald)</span>
							<span>{formatEur(totals.committed)}</span>
						</li>
						<li className="con-line">
							<span className="con-line-main">In behandeling (ingediend)</span>
							<span>{formatEur(totals.pending)}</span>
						</li>
						{remaining !== null && (
							<li className="con-line">
								<span className="con-line-main">Resterend</span>
								<span>
									<StatusBadge domain="expense" status={overBudget ? 'rejected' : 'approved'} label={formatEur(remaining)} />
								</span>
							</li>
						)}
					</ul>
					<DataTable columns={columns} data={expenses} empty={{ title: 'Geen kosten', description: 'Nog geen declaraties gekoppeld aan deze conventie.' }} />
				</>
			) : (
				<Alert variant="info">Je kunt hier het budget instellen. Het inzien van de gekoppelde declaraties vereist het recht “declaraties beheren”.</Alert>
			)}
		</div>
	);
};

export default CostsTab;
