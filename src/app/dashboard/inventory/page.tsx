import type { Metadata } from 'next';

import InventoryManager from '@/app/dashboard/inventory/_components/InventoryManager';

import '@/app/dashboard/inventory.scss';

export const metadata: Metadata = { title: 'Inventory & conventies', robots: { index: false, follow: false } };

const InventoryPage = () => <InventoryManager />;

export default InventoryPage;
