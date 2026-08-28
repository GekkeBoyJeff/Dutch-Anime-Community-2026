'use client';

import { useSearchParams } from 'next/navigation';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Title from '@/components/basics/Title';
import { signInWithDiscord } from '@/lib/shared/auth/permissions';

const LoginForm = () => {
	const next = useSearchParams().get('next') ?? '/dashboard';
	return (
		<Container element="main" className="auth-page">
			<Title size={2} value="Inloggen" />
			<Content element="p" value="Log in met je Discord-account om verder te gaan." />
			<Button variant="primary" icon="external" onClick={() => signInWithDiscord(next)} value="Log in met Discord" />
		</Container>
	);
};

export default LoginForm;
