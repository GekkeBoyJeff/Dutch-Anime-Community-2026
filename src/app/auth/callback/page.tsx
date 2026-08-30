import type { Metadata } from 'next';
import { Suspense } from 'react';

import CallbackInner from '@/app/auth/callback/_components/CallbackInner';

import '@/app/login/login.scss';

export const metadata: Metadata = { title: 'Inloggen…', robots: { index: false, follow: false } };

// useSearchParams() (in CallbackInner) needs a Suspense boundary to prerender in the static export.
const CallbackPage = () => (
	<Suspense>
		<CallbackInner />
	</Suspense>
);

export default CallbackPage;
