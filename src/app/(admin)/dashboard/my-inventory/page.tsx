import type { Metadata } from 'next';

import MyInventory from '@/components/dashboard/my-inventory/MyInventory';

export const metadata: Metadata = { title: 'Mijn inventory & conventies', robots: { index: false, follow: false } };

const MyInventoryPage = () => <MyInventory />;

export default MyInventoryPage;
