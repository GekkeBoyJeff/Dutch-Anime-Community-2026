import type { Metadata } from 'next';

import ProfilePanel from '@/app/(admin)/account/_components/ProfilePanel';

import '@/app/(admin)/dashboard/inventory.scss';
import '@/app/(admin)/dashboard/moderation/moderation.scss';

export const metadata: Metadata = { title: 'Mijn profiel', robots: { index: false, follow: false } };

const AccountPage = () => <ProfilePanel />;

export default AccountPage;
