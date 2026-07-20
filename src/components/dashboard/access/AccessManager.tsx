'use client';

import { Toast } from '@base-ui/react/toast';
import { useEffect, useMemo, useState } from 'react';

import Alert from '@/components/basics/Alert';
import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import Drawer from '@/components/components/Drawer';
import FilterBar from '@/components/components/FilterBar';
import PermissionGroups from '@/components/components/PermissionGroups';
import AccessMatrixTable, { type AccessRow } from '@/components/dashboard/components/AccessMatrixTable';
import { rememberRowCount } from '@/components/dashboard/components/DataTableSkeleton';
import ListboxCards, { type ListboxCardOption } from '@/components/dashboard/components/ListboxCards';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { APP_ROLES, type Permission } from '@/lib/auth/permissions';
import type { FilterOption } from '@/lib/content/schema/primitives';
import { getBrowserClient } from '@/lib/supabase/client';
import type { Enums } from '@/types/database.types';

// Human role labels + one-line descriptions for the card picker (ROLE-BLUEPRINT: role sets emphasis,
// permissions set access — the description hints at the bundle each role carries).
const ROLE_META: Record<string, { label: string; description: string; icon: string }> = {
	user: { label: 'Lid', description: 'Basis-toegang: eigen profiel, badges en enquêtes.', icon: 'user' },
	'stand-staff': { label: 'Standteam', description: 'Veld-taken: inventaris bekijken en declareren.', icon: 'users' },
	yakuza: { label: 'Yakuza', description: 'Organisatie: events, team, moderatie en financiën.', icon: 'star' },
	author: { label: 'Auteur', description: "Content: pagina's, media en enquêtes publiceren.", icon: 'file' },
	admin: { label: 'Beheerder', description: 'Volledige toegang inclusief toegangsbeheer en logs.', icon: 'settings' },
};

const roleLabel = (role: string) => ROLE_META[role]?.label ?? role;
const roleCardOptions: ListboxCardOption[] = APP_ROLES.map((role) => ({ value: role, ...ROLE_META[role], label: roleLabel(role) }));
const nameOf = (row: AccessRow) => row.username ?? row.id.slice(0, 8);

// Assign roles + per-user permission grants. All writes go through PostgREST under the caller's JWT;
// RLS requires roles.manage AND a target other than self, so the UI disables self-editing to match.
// Role-first: the list shows the role inline (the 95% action); fine-grained per-user grants live in a
// detail-drawer, grouped per domain, so nothing overflows horizontally. Mutations bump refreshKey,
// which re-runs the fetch effect (setState stays inside the async callback).
const AccessManager = () => {
	const { ready, fallback, session } = useDashboardGuard('roles.manage', { className: 'access-page', label: 'Toegangsbeheer laden' });
	const [rows, setRows] = useState<AccessRow[] | null>(null);
	const [roleGrants, setRoleGrants] = useState<Map<string, Set<Permission>>>(new Map());
	const [refreshKey, setRefreshKey] = useState(0);
	const [search, setSearch] = useState('');
	const [roleFilter, setRoleFilter] = useState('');
	const [openUserId, setOpenUserId] = useState<string | null>(null);
	const toast = Toast.useToastManager();

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('profiles').select('id, username'),
			db.from('user_roles').select('user_id, role'),
			db.from('user_permissions').select('user_id, permission'),
			db.from('role_permissions').select('role, permission'),
		]).then(([{ data: profiles }, { data: roles }, { data: grants }, { data: rolePerms }]) => {
			if (!active) return;
			const roleBy = new Map((roles ?? []).map((r) => [r.user_id as string, r.role as string]));
			const grantBy = new Map<string, Set<Permission>>();
			for (const g of grants ?? []) {
				const set = grantBy.get(g.user_id as string) ?? new Set<Permission>();
				set.add(g.permission as Permission);
				grantBy.set(g.user_id as string, set);
			}
			const rg = new Map<string, Set<Permission>>();
			for (const rp of rolePerms ?? []) {
				const set = rg.get(rp.role as string) ?? new Set<Permission>();
				set.add(rp.permission as Permission);
				rg.set(rp.role as string, set);
			}
			setRoleGrants(rg);
			const mapped = (profiles ?? []).map((p) => ({
				id: p.id as string,
				username: p.username as string | null,
				role: roleBy.get(p.id as string) ?? 'user',
				grants: grantBy.get(p.id as string) ?? new Set<Permission>(),
			}));
			setRows(mapped);
			rememberRowCount('access', mapped.length);
		});
		return () => {
			active = false;
		};
	}, [ready, session, refreshKey]);

	const setRole = async (userId: string, role: string) => {
		const { error: err } = await getBrowserClient().from('user_roles').upsert({ user_id: userId, role: role as Enums<'app_role'> }, { onConflict: 'user_id' });
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: 'Rol bijgewerkt', type: 'success' });
	};

	const toggleGrant = async (userId: string, permission: Permission, on: boolean) => {
		const db = getBrowserClient();
		const { error: err } = on
			? await db.from('user_permissions').insert({ user_id: userId, permission })
			: await db.from('user_permissions').delete().eq('user_id', userId).eq('permission', permission);
		if (err) {
			toast.add({ title: 'Er ging iets mis', description: err.message, type: 'error' });
			return;
		}
		setRefreshKey((k) => k + 1);
		toast.add({ title: on ? 'Permissie verleend' : 'Permissie ingetrokken', type: 'success' });
	};

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return (rows ?? []).filter((row) => {
			const matchesSearch = q === '' || nameOf(row).toLowerCase().includes(q);
			const matchesRole = roleFilter === '' || row.role === roleFilter;
			return matchesSearch && matchesRole;
		});
	}, [rows, search, roleFilter]);

	// Per-role tallies feed the filter-pill count badges (whole set, not the filtered view).
	const roleFilters = useMemo<FilterOption[]>(() => {
		const counts = new Map<string, number>();
		for (const row of rows ?? []) counts.set(row.role, (counts.get(row.role) ?? 0) + 1);
		return [
			{ value: '', label: 'Alle rollen', count: rows?.length ?? 0 },
			...APP_ROLES.map((role) => ({ value: role, label: roleLabel(role), count: counts.get(role) ?? 0 })),
		];
	}, [rows]);

	if (!ready || !session) return fallback;

	const loading = rows === null;
	const selfId = session.user.id;
	const drawerUser = openUserId ? (rows ?? []).find((row) => row.id === openUserId) ?? null : null;

	return (
		<Container className="access-page">
			<Title size={2}>Toegangsbeheer</Title>
			<Alert variant="info">Je kunt je eigen rol of permissies niet wijzigen.</Alert>

			<FilterBar
				filters={roleFilters}
				value={roleFilter}
				onValueChange={setRoleFilter}
				label="Filter op rol"
				filterIcon="filter"
				searchable
				searchValue={search}
				onSearchValueChange={setSearch}
				searchPlaceholder="Zoek op naam…"
				searchLabel="Zoek gebruiker"
			/>

			<AccessMatrixTable
				rows={filtered}
				loading={loading}
				selfId={selfId}
				roleGrants={roleGrants}
				empty={{
					title: 'Geen gebruikers gevonden',
					description: search || roleFilter ? 'Pas je zoekopdracht of filter aan.' : 'Er zijn nog geen gebruikers.',
				}}
				onSetRole={setRole}
				onOpenUser={setOpenUserId}
			/>

			<Drawer
				open={openUserId !== null}
				onOpenChange={(open) => !open && setOpenUserId(null)}
				title={drawerUser ? nameOf(drawerUser) : 'Gebruiker'}
				size="26rem"
				footer={
					<Button variant="secondary" onClick={() => setOpenUserId(null)}>
						Sluiten
					</Button>
				}
			>
				{drawerUser && (
					<div className="access-drawer-body">
						<div className="access-drawer-role">
							<span className="access-drawer-label">Rol</span>
							<ListboxCards
								aria-label={`Rol voor ${nameOf(drawerUser)}`}
								disabled={drawerUser.id === selfId}
								value={drawerUser.role}
								options={roleCardOptions}
								onValueChange={(value) => setRole(drawerUser.id, value)}
							/>
						</div>
						<PermissionGroups
							roleGrants={roleGrants.get(drawerUser.role) ?? new Set()}
							userGrants={drawerUser.grants}
							onToggle={(permission, on) => toggleGrant(drawerUser.id, permission, on)}
							disabled={drawerUser.id === selfId}
						/>
					</div>
				)}
			</Drawer>
		</Container>
	);
};

export default AccessManager;
