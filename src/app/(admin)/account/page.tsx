import type { Metadata } from 'next';

import Container from '@/components/basics/Container/Container';
import Title from '@/components/basics/Title/Title';

export const metadata: Metadata = { title: 'Mijn profiel', robots: { index: false, follow: false } };

const AccountPage = () => (
	<Container>
		<Title size={1} value="Mijn profiel" />
	</Container>
);

export default AccountPage;
