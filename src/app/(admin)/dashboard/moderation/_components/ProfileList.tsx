'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import Button from '@/components/basics/Button';
import StatusBadge from '@/components/basics/StatusBadge';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import Drawer from '@/components/components/Drawer';
import FilterBar from '@/components/components/FilterBar';
import Field from '@/components/forms/Field';
import TextInput from '@/components/forms/TextInput';
import { type Subject } from '@/lib/moderation/types';
import { getBrowserClient } from '@/lib/supabase/client';

type Props = { canManage: boolean; onOpen: (id: string) => void };
type Row = Subject & { display: string; active_yellow: number; active_red: number };

// Profielenlijst: leest mod_subjects DIRECT (subject_names bevat alléén echte accounts, geen schaduwen),
// verrijkt met de weergavenaam en het aantal actieve warnings per kleur.
const ProfileList = ({ canManage, onOpen }: Props) => {
	const toast = Toast.useToastManager();
	const [rows, setRows] = useState<Row[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [search, setSearch] = useState('');
	const [filter, setFilter] = useState('');
	const [newForm, setNewForm] = useState<{ discord_id: string; discord_name: string } | null>(null);
	const [busy, setBusy] = useState(false);

	useEffect(() => {
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('mod_subjects').select('id, discord_id, discord_name, user_id, merged_into, created_at').order('created_at', { ascending: false }),
			db.from('subject_names').select('id, display_name'),
			db.from('mod_warnings').select('subject_id, color, removed_at').is('removed_at', null),
		]).then((res) => {
			if (!active) return;
			const failed = res.find((r) => r.error)?.error;
			if (failed) {
				toast.add({ title: 'Kon profielen niet laden', description: failed.message, type: 'error' });
				return;
			}
			const [{ data: subjects }, { data: names }, { data: warnings }] = res;
			const nameMap = new Map((names ?? []).map((n) => [n.id as string, n.display_name as string]));
			const yellow = new Map<string, number>();
			const red = new Map<string, number>();
			for (const w of warnings ?? []) {
				const target = (w.color as string) === 'red' ? red : yellow;
				target.set(w.subject_id as string, (target.get(w.subject_id as string) ?? 0) + 1);
			}
			setRows(
				((subjects ?? []) as Subject[]).map((s) => ({
					...s,
					display: nameMap.get(s.id) ?? s.discord_name ?? s.discord_id ?? s.id.slice(0, 8),
					active_yellow: yellow.get(s.id) ?? 0,
					active_red: red.get(s.id) ?? 0,
				})),
			);
		});
		return () => {
			active = false;
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [refreshKey]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return rows.filter((r) => {
			const matchesSearch = q === '' || r.display.toLowerCase().includes(q) || (r.discord_id ?? '').toLowerCase().includes(q);
			const matchesFilter =
				filter === '' ||
				(filter === 'real' && r.user_id !== null) ||
				(filter === 'shadow' && r.user_id === null) ||
				(filter === 'merged' && r.merged_into !== null);
			return matchesSearch && matchesFilter;
		});
	}, [rows, search, filter]);

	const createShadow = async () => {
		if (!newForm) return;
		setBusy(true);
		try {
			const { error } = await getBrowserClient()
				.from('mod_subjects')
				.insert({ discord_id: newForm.discord_id.trim() || null, discord_name: newForm.discord_name.trim() || null });
			if (error) {
				toast.add({ title: 'Er ging iets mis', description: error.message, type: 'error' });
				return;
			}
			setNewForm(null);
			setRefreshKey((k) => k + 1);
			toast.add({ title: 'Schaduwprofiel aangemaakt', type: 'success' });
		} finally {
			setBusy(false);
		}
	};

	const columns: DataTableColumn<Row>[] = useMemo(
		() => [
			{ key: 'name', header: 'Profiel', sortable: true, sortValue: (r) => r.display, cell: (r) => r.display },
			{ key: 'discord', header: 'Discord-ID', cell: (r) => r.discord_id ?? '—' },
			{
				key: 'type',
				header: 'Type',
				cell: (r) => (
					<span className="mod-meta">
						<StatusBadge domain="request" status={r.user_id ? 'active' : 'requested'} label={r.user_id ? 'Account' : 'Schaduw'} />
						{r.merged_into && <StatusBadge domain="request" status="cancelled" label="Samengevoegd" />}
					</span>
				),
			},
			{
				key: 'warnings',
				header: 'Warnings',
				align: 'center',
				cell: (r) => (
					<span className="mod-meta">
						{r.active_red > 0 && <StatusBadge domain="warning" status="red" label={`Rood ${r.active_red}`} />}
						{r.active_yellow > 0 && <StatusBadge domain="warning" status="yellow" label={`Geel ${r.active_yellow}`} />}
						{r.active_red === 0 && r.active_yellow === 0 && '—'}
					</span>
				),
			},
			{ key: 'actions', header: '', align: 'end', cell: (r) => <Button variant="primary" onClick={() => onOpen(r.id)}>Bekijk</Button> },
		],
		[onOpen],
	);

	return (
		<div className="inventory-tab">
			<Title size={2}>Moderatie</Title>
			<div className="inventory-toolbar">
				<FilterBar
					filters={[
						{ label: 'Alle', value: '' },
						{ label: 'Accounts', value: 'real' },
						{ label: 'Schaduw', value: 'shadow' },
						{ label: 'Samengevoegd', value: 'merged' },
					]}
					value={filter}
					onValueChange={setFilter}
					label="Filter profielen"
					searchable
					searchValue={search}
					onSearchValueChange={setSearch}
					searchPlaceholder="Zoek op naam of Discord-ID…"
					searchLabel="Zoek profiel"
				/>
				{canManage && (
					<Button variant="primary" icon="plus" onClick={() => setNewForm({ discord_id: '', discord_name: '' })}>
						Nieuw schaduwprofiel
					</Button>
				)}
			</div>
			<DataTable columns={columns} data={filtered} empty={{ title: 'Geen profielen', description: 'Pas je zoekopdracht aan of maak een schaduwprofiel.' }} />

			<Drawer
				open={newForm !== null}
				onOpenChange={(o) => !o && setNewForm(null)}
				title="Nieuw schaduwprofiel"
				size="30rem"
				footer={
					<>
						<Button variant="secondary" onClick={() => setNewForm(null)}>
							Annuleren
						</Button>
						<Button variant="primary" onClick={createShadow} disabled={busy}>
							{busy ? 'Bezig…' : 'Aanmaken'}
						</Button>
					</>
				}
			>
				{newForm && (
					<div className="inventory-form">
						<Field name="discord_id">
							<Field.Label>Discord-ID</Field.Label>
							<TextInput value={newForm.discord_id} onChange={(e) => setNewForm({ ...newForm, discord_id: e.currentTarget.value })} />
						</Field>
						<Field name="discord_name">
							<Field.Label>Discord-naam</Field.Label>
							<TextInput value={newForm.discord_name} onChange={(e) => setNewForm({ ...newForm, discord_name: e.currentTarget.value })} />
						</Field>
					</div>
				)}
			</Drawer>
		</div>
	);
};

export default ProfileList;
