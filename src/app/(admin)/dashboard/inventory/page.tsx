import type { Metadata } from 'next';

import InventoryManager from '@/app/(admin)/dashboard/inventory/_components/InventoryManager';

import '@/app/(admin)/dashboard/inventory.scss';

export const metadata: Metadata = { title: 'Inventaris', robots: { index: false, follow: false } };

const InventoryPage = () => <InventoryManager />;

export default InventoryPage;
