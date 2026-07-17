import type { Metadata } from 'next';
import { Suspense } from 'react';

import ModerationManager from '@/app/(admin)/dashboard/moderation/_components/ModerationManager';

import '@/app/(admin)/dashboard/inventory.scss';
import '@/app/(admin)/dashboard/moderation/moderation.scss';

export const metadata: Metadata = { title: 'Moderatie', robots: { index: false, follow: false } };

const ModerationPage = () => (
	<Suspense>
		<ModerationManager />
	</Suspense>
);

export default ModerationPage;
