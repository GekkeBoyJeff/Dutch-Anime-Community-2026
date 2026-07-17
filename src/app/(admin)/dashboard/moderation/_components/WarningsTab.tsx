'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import EvidenceDrawer from '@/app/(admin)/dashboard/moderation/_components/EvidenceDrawer';
import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import { formatDate } from '@/lib/formatDate';
import { type WarnColor, WARN_COLOR_OPTIONS, type Warning } from '@/lib/moderation/types';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { subjectId: string; sessionUserId: string; canManage: boolean; canDelete: boolean };

// Warnings van dit profiel: uitdelen (rang-regel in RLS), intrekken (soft: removed_at), en bewijs beheren.
const WarningsTab = ({ subjectId, sessionUserId, canManage, canDelete }: Props) => {
	const toast = Toast.useToastManager();
	const [warnings, setWarnings] = useState<Warning[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [form, setForm] = useState<{ color: WarnColor; reason: string } | null>(null);
	const [evidenceFor, setEvidenceFor] = useState<string | null>(null);
	const [toRemove, setToRemove] = useState<Warning | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let active = true;
		getBrowserClient()
			.from('mod_warnings')
			.select('id, subject_id, color, reason, issued_at, issued_by, removed_at')
			.eq('subject_id', subjectId)
			.order('issued_at', { ascending: false })
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon warnings niet laden', description: error.message, type: 'error' });
					return;
				}
				setWarnings((data ?? []) as Warning[]);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subjectId, refreshKey]);

	const add = async () => {
		if (!form) return;
		if (!form.reason.trim()) {
			toast.add({ title: 'Reden is verplicht.', type: 'error' });
			return;
		}
		setBusy(true);
		try {
			const { error } = await getBrowserClient()
				.from('mod_warnings')
				.insert({ subject_id: subjectId, color: form.color, reason: form.reason.trim(), issued_by: sessionUserId });
			if (error) {
				// De rang-regel (RLS) blokkeert warnen boven/gelijk je eigen rang → nette melding.
				toast.add({ title: 'Kon warning niet uitdelen', description: error.message, type: 'error' });
				return;
			}
			setForm(null);
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Warning uitgedeeld', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const removeWarning = async (w: Warning) => {
		const { data, error } = await getBrowserClient()
			.from('mod_warnings')
			.update({ removed_at: new Date().toISOString(), removed_by: sessionUserId })
			.eq('id', w.id)
			.select();
		if (error) {
			toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		if (!data || data.length === 0) {
			toast.add({ title: 'Intrekken niet gelukt', description: 'Je hebt niet de juiste rang voor dit profiel.', type: 'error' });
			return;
		}
		toast.add({ title: 'Warning ingetrokken', type: 'success' });
	};

	const columns: DataTableColumn<Warning>[] = useMemo(
		() => [
			{ key: 'color', header: 'Kleur', cell: (w) => <StatusBadge domain="warning" status={w.color} /> },
			{ key: 'reason', header: 'Reden', cell: (w) => w.reason },
			{ key: 'issued', header: 'Datum', align: 'center', sortable: true, sortValue: (w) => w.issued_at, cell: (w) => formatDate(w.issued_at, { dateStyle: 'medium' }) ?? w.issued_at },
			{
				key: 'status',
				header: 'Status',
				align: 'center',
				cell: (w) => <StatusBadge domain="request" status={w.removed_at ? 'cancelled' : 'active'} label={w.removed_at ? 'Ingetrokken' : 'Actief'} />,
			},
			{
				key: 'actions',
				header: '',
				align: 'end',
				cell: (w) => (
					<span className="inventory-row-actions">
						<Button variant="secondary" onClick={() => setEvidenceFor(w.id)}>
							Bewijs
						</Button>
						{canManage && !w.removed_at && (
							<Button variant="ghost" onClick={() => setToRemove(w)}>
								Intrekken
							</Button>
						)}
					</span>
				),
			},
		],
		[canManage],
	);

	return (
		<div className="inventory-tab">
			{canManage && (
				<div className="inventory-toolbar">
					<Button variant="primary" icon="plus" onClick={() => setForm({ color: 'yellow', reason: '' })}>
						Warning uitdelen
					</Button>
				</div>
			)}
			<DataTable columns={columns} data={warnings} empty={{ title: 'Geen warnings', description: 'Dit profiel heeft nog geen warnings.' }} />

			<Drawer
				open={form !== null}
				onOpenChange={(o) => !o && setForm(null)}
				title="Warning uitdelen"
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={add} disabled={busy}>
							{busy ? 'Bezig…' : 'Uitdelen'}
						</Button>
					</>
				}
			>
				{form && (
					<div className="inventory-form">
						<Field name="color">
							<Field.Label>Kleur</Field.Label>
							<Select native value={form.color} onValueChange={(v) => setForm({ ...form, color: ((v as string) ?? 'yellow') as WarnColor })} options={WARN_COLOR_OPTIONS} />
						</Field>
						<Field name="reason">
							<Field.Label>Reden</Field.Label>
							<TextArea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>

			<EvidenceDrawer
				table="mod_evidence"
				fkColumn="warning_id"
				fkValue={evidenceFor}
				title="Bewijs bij warning"
				canManage={canManage}
				canDelete={canDelete}
				onClose={() => setEvidenceFor(null)}
			/>

			<ConfirmDialog
				open={toRemove !== null}
				onOpenChange={(o) => !o && setToRemove(null)}
				title="Warning intrekken?"
				description={toRemove ? `De ${toRemove.color === 'red' ? 'rode' : 'gele'} warning wordt gemarkeerd als ingetrokken.` : undefined}
				confirmLabel="Intrekken"
				destructive
				onConfirm={() => {
					if (toRemove) removeWarning(toRemove);
					setToRemove(null);
				}}
			/>
		</div>
	);
};

export default WarningsTab;
