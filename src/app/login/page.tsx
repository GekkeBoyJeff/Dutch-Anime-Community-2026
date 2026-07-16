import type { Metadata } from 'next';

import LoginForm from '@/app/login/_components/LoginForm';

import '@/app/login/login.scss';

export const metadata: Metadata = { title: 'Inloggen', robots: { index: false, follow: false } };

const LoginPage = () => <LoginForm />;

export default LoginPage;
