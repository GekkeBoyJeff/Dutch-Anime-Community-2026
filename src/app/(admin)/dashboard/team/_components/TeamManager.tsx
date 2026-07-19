'use client';

import { Toast } from '@base-ui/react/toast';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import Avatar from '@/components/basics/Avatar';
import Badge from '@/components/basics/Badge';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';
import FilterBar from '@/components/components/FilterBar';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { ROLE_LABELS, type AppRole } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';

interface StaffRow {
	user_id: string;
	subject_id: string | null;
	display_name: string;
	avatar_url: string | null;
	discord_tag: string | null;
	role: AppRole;
	next_shift_at: string | null;
	next_shift_event_id: string | null;
	next_shift_event_name: string | null;
	open_warnings: number;
}

const fmt = (iso: string): string => new Date(iso).toLocaleString('nl-NL', { dateStyle: 'short', timeStyle: 'short' });

// First letters of the display name, for the avatar fallback when there is no image.
const initialsOf = (name: string): string =>
	name
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part.charAt(0).toUpperCase())
		.join('');

// Team (staff.manage): het conventieteam — standteam ∪ yakuza — in één RPC-round-trip (staff_overview),
// met naam, rol, Discord-tag, eerstvolgende shift en open warnings. Rijacties linken door naar moderatie
// en naar de event-editor; rol-/permissiebeheer blijft in Toegang. De échte grens zit in de RPC-RLS.
const TeamManager = () => {
	const { ready, fallback, session } = useDashboardGuard('staff.manage', { className: 'inventory', label: 'Team laden' });
	const toast = Toast.useToastManager();
	const router = useRouter();
	const [rows, setRows] = useState<StaffRow[]>([]);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState('');

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		getBrowserClient()
			.rpc('staff_overview')
			.then(({ data, error }) => {
				if (!active) return;
				if (error) {
					toast.add({ title: 'Kon team niet laden', description: error.message, type: 'error' });
					return;
				}
				setRows((data ?? []) as StaffRow[]);
			});
		return () => {
			active = false;
		};
	}, [ready, session, toast]);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return rows.filter((r) => {
			const matchesSearch = q === '' || r.display_name.toLowerCase().includes(q) || (r.discord_tag ?? '').toLowerCase().includes(q);
			const matchesRole = roleFilter === '' || r.role === roleFilter;
			return matchesSearch && matchesRole;
		});
	}, [rows, search, roleFilter]);

	const columns: DataTableColumn<StaffRow>[] = useMemo(
		() => [
			{
				key: 'name',
				header: 'Naam',
				sortable: true,
				sortValue: (r) => r.display_name,
				cell: (r) => (
					<span className="team-person">
						<Avatar size="s" src={r.avatar_url ?? undefined} alt={r.display_name} initials={initialsOf(r.display_name)} />
						{r.display_name}
					</span>
				),
			},
			{
				key: 'role',
				header: 'Rol',
				sortable: true,
				sortValue: (r) => r.role,
				cell: (r) => <Badge variant={r.role === 'yakuza' ? 'info' : 'neutral'}>{ROLE_LABELS[r.role]}</Badge>,
			},
			{ key: 'tag', header: 'Discord', cell: (r) => <span className="team-tag">{r.discord_tag ? `@${r.discord_tag}` : '—'}</span> },
			{
				key: 'shift',
				header: 'Eerstvolgende shift',
				sortable: true,
				sortValue: (r) => r.next_shift_at,
				cell: (r) =>
					r.next_shift_at ? (
						<span className="team-shift">
							<span>{fmt(r.next_shift_at)}</span>
							{r.next_shift_event_name && <span className="team-shift-event">{r.next_shift_event_name}</span>}
						</span>
					) : (
						'—'
					),
			},
			{
				key: 'warnings',
				header: 'Warnings',
				align: 'center',
				sortable: true,
				sortValue: (r) => r.open_warnings,
				cell: (r) => (r.open_warnings > 0 ? <Badge variant="error">{r.open_warnings}</Badge> : '—'),
			},
			{
				key: 'actions',
				header: '',
				align: 'end',
				cell: (r) => (
					<span className="team-actions">
						{r.subject_id && (
							<Button variant="secondary" onClick={() => router.push(`/dashboard/moderation?id=${r.subject_id}`)}>
								Bekijk in moderatie
							</Button>
						)}
						{r.next_shift_event_id && (
							<Button variant="secondary" onClick={() => router.push(`/dashboard/events?id=${r.next_shift_event_id}`)}>
								Shift
							</Button>
						)}
					</span>
				),
			},
		],
		[router],
	);

	if (!ready || !session) return fallback;

	return (
		<Container className="inventory team">
			<div className="inventory-tab">
				<Title size={2}>Team</Title>
				<div className="inventory-toolbar">
					<FilterBar
						filters={[
							{ label: 'Alle', value: '' },
							{ label: ROLE_LABELS.yakuza, value: 'yakuza' },
							{ label: ROLE_LABELS['stand-staff'], value: 'stand-staff' },
						]}
						value={roleFilter}
						onValueChange={setRoleFilter}
						label="Filter op rol"
						searchable
						searchValue={search}
						onSearchValueChange={setSearch}
						searchPlaceholder="Zoek op naam of Discord-tag…"
						searchLabel="Zoek teamlid"
					/>
				</div>
				<DataTable
					columns={columns}
					data={filtered}
					initialSort={{ key: 'shift', direction: 'asc' }}
					empty={{ title: 'Geen teamleden', description: 'Pas je filter of zoekopdracht aan.' }}
				/>
			</div>
		</Container>
	);
};

export default TeamManager;
