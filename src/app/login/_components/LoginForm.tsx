'use client';

import { useSearchParams } from 'next/navigation';

import Button from '@/components/basics/Button';
import Container from '@/components/basics/Container';
import Content from '@/components/basics/Content';
import Title from '@/components/basics/Title';
import { signInWithDiscord } from '@/lib/auth/permissions';

const LoginForm = () => {
	const next = useSearchParams().get('next') ?? '/dashboard';
	return (
		<Container element="main" className="auth-page">
			<Title size={2}>Inloggen</Title>
			<Content element="p">Log in met je Discord-account om verder te gaan.</Content>
			<Button variant="primary" icon="external" onClick={() => signInWithDiscord(next)}>
				Log in met Discord
			</Button>
		</Container>
	);
};

export default LoginForm;
