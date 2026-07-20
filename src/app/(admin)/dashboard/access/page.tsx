import type { Metadata } from 'next';

import AccessManager from '@/components/dashboard/access/AccessManager';

export const metadata: Metadata = { title: 'Toegangsbeheer', robots: { index: false, follow: false } };

const AccessPage = () => <AccessManager />;

export default AccessPage;
