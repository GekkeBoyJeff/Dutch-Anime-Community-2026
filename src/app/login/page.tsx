import type { Metadata } from 'next';
import { Suspense } from 'react';

import LoginForm from '@/app/login/_components/LoginForm';

import '@/app/login/login.scss';

export const metadata: Metadata = { title: 'Inloggen', robots: { index: false, follow: false } };

// useSearchParams() (in LoginForm) needs a Suspense boundary to prerender in the static export.
const LoginPage = () => (
	<Suspense>
		<LoginForm />
	</Suspense>
);

export default LoginPage;
