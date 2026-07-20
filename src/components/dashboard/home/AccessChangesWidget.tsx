'use client';

import Badge from '@/components/basics/Badge';
import DetailRow from '@/components/dashboard/components/DetailRow';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
import { formatDate } from '@/lib/formatDate';

import type { WidgetProps } from './types';
import { useWidgetData } from './useWidgetData';

// Recently granted per-user permission exceptions, for access managers. user_permissions carries
// created_at + the target user, both readable under roles.manage — so this stays reachable without the
// audit log (which is logs.view-gated). Deep links to Toegang.
const AccessChangesWidget = ({ session: _session }: WidgetProps) => {
	const { loading, error, data } = useWidgetData(async (db) => {
		const { data: grants, error: grantError } = await db.from('user_permissions').select('id, user_id, permission, created_at').order('created_at', { ascending: false }).limit(6);
		if (grantError) throw grantError;
		if (!grants || grants.length === 0) return null;

		const { data: profiles } = await db.from('profiles').select('id, username').in('id', [...new Set(grants.map((g) => g.user_id))]);
		const nameById = new Map((profiles ?? []).map((p) => [p.id as string, p.username as string | null]));
		return grants.map((g) => ({ id: g.id, name: nameById.get(g.user_id) ?? 'Onbekend lid', permission: g.permission, createdAt: g.created_at }));
	});

	return (
		<AsyncCard title="Recente toegangswijzigingen" href="/dashboard/access" linkLabel="Naar toegangsbeheer" loading={loading} error={error} isEmpty={!data} hideWhenEmpty>
			{data && (
				<ul className="widget-list">
					{data.map((grant) => (
						<DetailRow
							key={grant.id}
							main={grant.name}
							sub={formatDate(grant.createdAt, { dateStyle: 'medium' }) ?? grant.createdAt}
							trailing={<Badge variant="neutral">{grant.permission}</Badge>}
						/>
					))}
				</ul>
			)}
		</AsyncCard>
	);
};

export default AccessChangesWidget;
