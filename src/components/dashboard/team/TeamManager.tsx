'use client';

import { Toast } from '@base-ui/react/toast';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import Container from '@/components/basics/Container';
import Skeleton from '@/components/basics/Skeleton';
import Title from '@/components/basics/Title';
import EmptyState from '@/components/components/EmptyState';
import FilterBar from '@/components/components/FilterBar';
import { recallRowCount } from '@/components/dashboard/components/DataTableSkeleton';
import TeamMemberCard from '@/components/dashboard/components/TeamMemberCard';
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

// Team (staff.manage): het conventieteam — standteam ∪ yakuza — in één RPC-round-trip (staff_overview),
// met naam, rol, Discord-tag, eerstvolgende shift en open warnings. Rijacties linken door naar moderatie
// en naar de event-editor; rol-/permissiebeheer blijft in Toegang. De échte grens zit in de RPC-RLS.
const TeamManager = () => {
	const { ready, fallback, session } = useDashboardGuard('staff.manage', { className: 'inventory', label: 'Team laden' });
	const toast = Toast.useToastManager();
	const router = useRouter();
	const searchParams = useSearchParams();
	const [rows, setRows] = useState<StaffRow[] | null>(null);
	// Seed the filter from ?q= once (the ⌘K palette's people search deep-links here for staff-only users).
	const [search, setSearch] = useState(() => searchParams.get('q') ?? '');
	const [roleFilter, setRoleFilter] = useState('');
	const [skeletonCount] = useState(() => recallRowCount('team', 6));

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

	// Chronological by next shift (soonest first, members without a shift last) — mirrors the old table sort.
	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		return (rows ?? [])
			.filter((r) => {
				const matchesSearch = q === '' || r.display_name.toLowerCase().includes(q) || (r.discord_tag ?? '').toLowerCase().includes(q);
				const matchesRole = roleFilter === '' || r.role === roleFilter;
				return matchesSearch && matchesRole;
			})
			.sort((a, b) => (a.next_shift_at ?? '9999') < (b.next_shift_at ?? '9999') ? -1 : 1);
	}, [rows, search, roleFilter]);

	if (!ready || !session) return fallback;

	const loading = rows === null;

	const renderCard = (r: StaffRow) => (
		<TeamMemberCard
			key={r.user_id}
			member={{
				displayName: r.display_name,
				avatarUrl: r.avatar_url,
				discordTag: r.discord_tag,
				role: r.role,
				nextShiftAt: r.next_shift_at,
				nextShiftEventName: r.next_shift_event_name,
				openWarnings: r.open_warnings,
			}}
			onOpenModeration={r.subject_id ? () => router.push(`/dashboard/moderation?id=${r.subject_id}`) : undefined}
			onOpenShift={r.next_shift_event_id ? () => router.push(`/dashboard/events?id=${r.next_shift_event_id}`) : undefined}
		/>
	);

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
						filterIcon="filter"
						searchable
						searchValue={search}
						onSearchValueChange={setSearch}
						searchPlaceholder="Zoek op naam of Discord-tag…"
						searchLabel="Zoek teamlid"
					/>
				</div>
				{loading ? (
					<div className="team-grid" aria-hidden="true">
						{Array.from({ length: skeletonCount }, (_, i) => (
							<article key={i} className="team-member-card is-skeleton">
								<header className="head">
									<Skeleton width="3rem" height="3rem" circle />
									<div className="ident">
										<Skeleton width="60%" height="1.1rem" />
										<Skeleton width="40%" height="0.8rem" />
									</div>
								</header>
								<div className="meta">
									<Skeleton width="80%" height="0.9rem" />
								</div>
								<footer className="actions">
									<Skeleton width="8rem" height="2rem" radius="m" />
								</footer>
							</article>
						))}
					</div>
				) : filtered.length === 0 ? (
					<EmptyState icon="users" title="Geen teamleden" description="Pas je filter of zoekopdracht aan." />
				) : (
					<div className="team-grid reveal">{filtered.map(renderCard)}</div>
				)}
			</div>
		</Container>
	);
};

export default TeamManager;
