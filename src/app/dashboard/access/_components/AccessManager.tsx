'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';

import Alert from '@/components/basics/Alert';
import Container from '@/components/basics/Container';
import Title from '@/components/basics/Title';
import Table from '@/components/components/Table';
import Checkbox from '@/components/forms/Checkbox';
import Select from '@/components/forms/Select';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';
import { APP_PERMISSIONS, APP_ROLES, type Permission } from '@/lib/auth/permissions';
import { getBrowserClient } from '@/lib/supabase/client';

interface Row {
	id: string;
	username: string | null;
	role: string;
	grants: Set<Permission>;
}

// Assign roles + per-user permission grants. All writes go through PostgREST under the caller's JWT;
// RLS requires roles.manage AND a target other than self, so the UI disables self-editing to match.
// Mutations bump refreshKey, which re-runs the fetch effect (setState stays inside the async callback).
const AccessManager = () => {
	const { ready, fallback, session } = useDashboardGuard('roles.manage', { className: 'access-page', label: 'Toegangsbeheer laden' });
	const [rows, setRows] = useState<Row[]>([]);
	const [refreshKey, setRefreshKey] = useState(0);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		if (!ready || !session) return;
		let active = true;
		const db = getBrowserClient();
		Promise.all([
			db.from('profiles').select('id, username'),
			db.from('user_roles').select('user_id, role'),
			db.from('user_permissions').select('user_id, permission'),
		]).then(([{ data: profiles }, { data: roles }, { data: grants }]) => {
			if (!active) return;
			const roleBy = new Map((roles ?? []).map((r) => [r.user_id as string, r.role as string]));
			const grantBy = new Map<string, Set<Permission>>();
			for (const g of grants ?? []) {
				const set = grantBy.get(g.user_id as string) ?? new Set<Permission>();
				set.add(g.permission as Permission);
				grantBy.set(g.user_id as string, set);
			}
			setRows(
				(profiles ?? []).map((p) => ({
					id: p.id as string,
					username: p.username as string | null,
					role: roleBy.get(p.id as string) ?? 'user',
					grants: grantBy.get(p.id as string) ?? new Set<Permission>(),
				})),
			);
		});
		return () => {
			active = false;
		};
	}, [ready, session, refreshKey]);

	const setRole = async (userId: string, role: string) => {
		const { error: err } = await getBrowserClient().from('user_roles').upsert({ user_id: userId, role }, { onConflict: 'user_id' });
		if (err) {
			setError(err.message);
			return;
		}
		setError(null);
		setRefreshKey((k) => k + 1);
	};

	const toggleGrant = async (userId: string, permission: Permission, on: boolean) => {
		const db = getBrowserClient();
		const { error: err } = on
			? await db.from('user_permissions').insert({ user_id: userId, permission })
			: await db.from('user_permissions').delete().eq('user_id', userId).eq('permission', permission);
		if (err) {
			setError(err.message);
			return;
		}
		setError(null);
		setRefreshKey((k) => k + 1);
	};

	if (!ready || !session) return fallback;

	const columns = [
		{ header: 'Gebruiker' },
		{ header: 'Rol' },
		...APP_PERMISSIONS.map((p) => ({ header: p, align: 'center' as const })),
	];

	const tableRows: ReactNode[][] = rows.map((r) => {
		const self = r.id === session.user.id;
		const who = r.username ?? r.id.slice(0, 8);
		return [
			who,
			<Select
				key="role"
				native
				className="access-role-select"
				aria-label={`Rol voor ${who}`}
				disabled={self}
				value={r.role}
				options={APP_ROLES.map((role) => ({ value: role, label: role }))}
				onValueChange={(value) => setRole(r.id, value as string)}
			/>,
			...APP_PERMISSIONS.map((p) => (
				<Checkbox
					key={p}
					aria-label={`${p} voor ${who}`}
					checked={r.grants.has(p)}
					disabled={self}
					onCheckedChange={(on) => toggleGrant(r.id, p, on)}
				/>
			)),
		];
	});

	return (
		<Container className="access-page">
			<Title size={2}>Toegangsbeheer</Title>
			<Alert variant="info">Je kunt je eigen rol of permissies niet wijzigen.</Alert>
			{error && (
				<Alert variant="error" title="Er ging iets mis">
					{error}
				</Alert>
			)}
			<Table columns={columns} rows={tableRows} bordered />
		</Container>
	);
};

export default AccessManager;
