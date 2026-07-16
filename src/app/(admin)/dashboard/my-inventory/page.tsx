import type { Metadata } from 'next';

import MyInventory from '@/app/(admin)/dashboard/my-inventory/_components/MyInventory';

import '@/app/(admin)/dashboard/inventory.scss';

export const metadata: Metadata = { title: 'Mijn inventory & conventies', robots: { index: false, follow: false } };

const MyInventoryPage = () => <MyInventory />;

export default MyInventoryPage;
