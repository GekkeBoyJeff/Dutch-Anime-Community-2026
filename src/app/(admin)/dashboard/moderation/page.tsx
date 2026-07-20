import type { Metadata } from 'next';
import { Suspense } from 'react';

import ModerationManager from '@/components/dashboard/moderation/ModerationManager';

export const metadata: Metadata = { title: 'Moderatie', robots: { index: false, follow: false } };

const ModerationPage = () => (
	<Suspense>
		<ModerationManager />
	</Suspense>
);

export default ModerationPage;
