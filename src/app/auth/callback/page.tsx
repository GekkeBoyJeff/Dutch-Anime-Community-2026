import type { Metadata } from 'next';

import CallbackInner from '@/app/auth/callback/_components/CallbackInner';

import '@/app/login/login.scss';

export const metadata: Metadata = { title: 'Inloggen…', robots: { index: false, follow: false } };

const CallbackPage = () => <CallbackInner />;

export default CallbackPage;
