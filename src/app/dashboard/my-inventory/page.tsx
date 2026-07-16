import type { Metadata } from 'next';

import MyInventory from '@/app/dashboard/my-inventory/_components/MyInventory';

import '@/app/dashboard/inventory.scss';

export const metadata: Metadata = { title: 'Mijn inventory & conventies', robots: { index: false, follow: false } };

const MyInventoryPage = () => <MyInventory />;

export default MyInventoryPage;
