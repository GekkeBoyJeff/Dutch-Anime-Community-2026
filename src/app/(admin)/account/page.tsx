import type { Metadata } from 'next';

import ProfilePanel from '@/components/dashboard/account/ProfilePanel';

export const metadata: Metadata = { title: 'Mijn profiel', robots: { index: false, follow: false } };

const AccountPage = () => <ProfilePanel />;

export default AccountPage;
