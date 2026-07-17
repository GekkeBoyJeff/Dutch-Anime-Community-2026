'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import ProfileDetail from '@/app/(admin)/dashboard/moderation/_components/ProfileDetail';
import ProfileList from '@/app/(admin)/dashboard/moderation/_components/ProfileList';
import Container from '@/components/basics/Container';
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

	return (
		<Container className="inventory moderation">
			{subjectId ? (
				<ProfileDetail subjectId={subjectId} sessionUserId={session.user.id} canManage={canManage} canDelete={canDelete} onBack={() => router.push('/dashboard/moderation')} />
			) : (
				<ProfileList canManage={canManage} onOpen={(id) => router.push(`/dashboard/moderation?id=${id}`)} />
			)}
		</Container>
	);
};

export default ModerationManager;
