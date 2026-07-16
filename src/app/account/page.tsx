import type { Metadata } from 'next';

import TermsGate from '@/app/_components/TermsGate';
import AccountPanel from '@/app/account/_components/AccountPanel';

import '@/app/login/login.scss';

export const metadata: Metadata = { title: 'Account', robots: { index: false, follow: false } };

const AccountPage = () => (
	<TermsGate>
		<AccountPanel />
	</TermsGate>
);

export default AccountPage;
