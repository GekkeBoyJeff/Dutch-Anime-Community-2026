import type { Metadata } from 'next';

import AccessManager from '@/app/(admin)/dashboard/access/_components/AccessManager';

import '@/app/(admin)/dashboard/dashboard.scss';

export const metadata: Metadata = { title: 'Toegangsbeheer', robots: { index: false, follow: false } };

const AccessPage = () => <AccessManager />;

export default AccessPage;
