'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import Container from '@/components/basics/Container';
import ProfileDetail from '@/components/dashboard/moderation/ProfileDetail';
import ProfileList from '@/components/dashboard/moderation/ProfileList';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';

// Moderatie (moderation.view). Query-param-route (?id=) i.p.v. [id] omdat de productie een statische export
// is: geen id → profielenlijst, met id → profieldetail. Schrijfacties zijn extra gated op moderation.manage
// (UI), maar de échte grens (incl. rang-regel) zit in RLS.
const ModerationManager = () => {
	const { ready, fallback, session, permissions } = useDashboardGuard('moderation.view', { className: 'inventory', label: 'Moderatie laden' });
	const router = useRouter();
	const subjectId = useSearchParams().get('id');

	if (!ready || !session) return fallback;
	const canManage = permissions.has('moderation.manage');
	const canDelete = permissions.has('records.delete');
	const canBadges = permissions.has('badges.manage');
	const canEditProfile = permissions.has('roles.manage');

	return (
		<Container className="inventory moderation">
			{subjectId ? (
				<ProfileDetail
					subjectId={subjectId}
					sessionUserId={session.user.id}
					canManage={canManage}
					canDelete={canDelete}
					canBadges={canBadges}
					canEditProfile={canEditProfile}
					onBack={() => router.push('/dashboard/moderation')}
				/>
			) : (
				<ProfileList canManage={canManage} onOpen={(id) => router.push(`/dashboard/moderation?id=${id}`)} />
			)}
		</Container>
	);
};

export default ModerationManager;
