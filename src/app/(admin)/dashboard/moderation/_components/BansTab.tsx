'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import ConfirmDialog from '@/components/components/ConfirmDialog';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import Field from '@/components/forms/Field';
import Select from '@/components/forms/Select';
import TextArea from '@/components/forms/TextArea';
import TextInput from '@/components/forms/TextInput';
import { formatDate } from '@/lib/formatDate';
import { BAN_SCOPE_LABELS, BAN_SCOPE_OPTIONS, type Ban, type BanScope } from '@/lib/moderation/types';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { subjectId: string; sessionUserId: string; canManage: boolean };

// Bans van dit profiel: uitdelen (rang-regel in RLS) + intrekken. scope 'site' is in v1 puur registratief.
const BansTab = ({ subjectId, sessionUserId, canManage }: Props) => {
	const toast = Toast.useToastManager();
	const [bans, setBans] = useState<Ban[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [form, setForm] = useState<{ scope: BanScope; reason: string; expires_on: string } | null>(null);
	const [toLift, setToLift] = useState<Ban | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let active = true;
		getBrowserClient()
			.from('mod_bans')
			.select('id, subject_id, scope, reason, issued_at, expires_at, lifted_at')
			.eq('subject_id', subjectId)
			.order('issued_at', { ascending: false })
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon bans niet laden', description: error.message, type: 'error' });
					return;
				}
				setBans((data ?? []) as Ban[]);
			});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [subjectId, refreshKey]);

	const add = async () => {
		if (!form || !form.reason.trim()) {
			toast.add({ title: 'Reden is verplicht.', type: 'error' });
			return;
		}
		setBusy(true);
		try {
			const { error } = await getBrowserClient()
				.from('mod_bans')
				.insert({ subject_id: subjectId, scope: form.scope, reason: form.reason.trim(), issued_by: sessionUserId, expires_at: form.expires_on ? new Date(form.expires_on).toISOString() : null });
			if (error) {
				toast.add({ title: 'Kon ban niet uitdelen', description: error.message, type: 'error' });
				return;
			}
			setForm(null);
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Ban uitgedeeld', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const lift = async (ban: Ban) => {
		const { data, error } = await getBrowserClient()
			.from('mod_bans')
			.update({ lifted_at: new Date().toISOString(), lifted_by: sessionUserId })
			.eq('id', ban.id)
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
		toast.add({ title: 'Ban ingetrokken', type: 'success' });
	};

	const columns: DataTableColumn<Ban>[] = useMemo(
		() => [
			{ key: 'scope', header: 'Scope', cell: (b) => BAN_SCOPE_LABELS[b.scope] ?? b.scope },
			{ key: 'reason', header: 'Reden', cell: (b) => b.reason },
			{ key: 'issued', header: 'Uitgedeeld', align: 'center', sortable: true, sortValue: (b) => b.issued_at, cell: (b) => formatDate(b.issued_at, { dateStyle: 'medium' }) ?? b.issued_at },
			{ key: 'expires', header: 'Verloopt', align: 'center', cell: (b) => (b.expires_at ? formatDate(b.expires_at, { dateStyle: 'medium' }) ?? b.expires_at : '—') },
			{
				key: 'status',
				header: 'Status',
				align: 'center',
				cell: (b) => <StatusBadge domain="request" status={b.lifted_at ? 'cancelled' : 'active'} label={b.lifted_at ? 'Ingetrokken' : 'Actief'} />,
			},
			{
				key: 'actions',
				header: '',
				align: 'end',
				cell: (b) =>
					canManage && !b.lifted_at ? (
						<Button variant="ghost" onClick={() => setToLift(b)}>
							Intrekken
						</Button>
					) : null,
			},
		],
		[canManage],
	);

	return (
		<div className="inventory-tab">
			{canManage && (
				<div className="inventory-toolbar">
					<Button variant="primary" icon="plus" onClick={() => setForm({ scope: 'discord', reason: '', expires_on: '' })}>
						Ban uitdelen
					</Button>
				</div>
			)}
			<DataTable columns={columns} data={bans} empty={{ title: 'Geen bans', description: 'Dit profiel heeft geen bans.' }} />

			<Drawer
				open={form !== null}
				onOpenChange={(o) => !o && setForm(null)}
				title="Ban uitdelen"
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
						<Field name="scope">
							<Field.Label>Scope</Field.Label>
							<Select native value={form.scope} onValueChange={(v) => setForm({ ...form, scope: ((v as string) ?? 'discord') as BanScope })} options={BAN_SCOPE_OPTIONS} />
						</Field>
						<Field name="reason">
							<Field.Label>Reden</Field.Label>
							<TextArea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.currentTarget.value })} />
						</Field>
						<Field name="expires">
							<Field.Label>Verloopt op (leeg = permanent)</Field.Label>
							<TextInput type="date" value={form.expires_on} onChange={(e) => setForm({ ...form, expires_on: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>

			<ConfirmDialog
				open={toLift !== null}
				onOpenChange={(o) => !o && setToLift(null)}
				title="Ban intrekken?"
				description={toLift ? `De ${BAN_SCOPE_LABELS[toLift.scope] ?? toLift.scope}-ban wordt ingetrokken.` : undefined}
				confirmLabel="Intrekken"
				destructive
				onConfirm={() => {
					if (toLift) lift(toLift);
					setToLift(null);
				}}
			/>
		</div>
	);
};

export default BansTab;
