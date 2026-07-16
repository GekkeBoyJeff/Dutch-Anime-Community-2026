import type { Metadata } from 'next';

import AccountPanel from '@/app/account/_components/AccountPanel';

import '@/app/login/login.scss';

export const metadata: Metadata = { title: 'Account', robots: { index: false, follow: false } };

const AccountPage = () => <AccountPanel />;

export default AccountPage;
