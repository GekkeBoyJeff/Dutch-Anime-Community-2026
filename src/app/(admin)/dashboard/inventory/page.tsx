import type { Metadata } from 'next';

import InventoryManager from '@/components/dashboard/inventory/InventoryManager';

export const metadata: Metadata = { title: 'Inventaris', robots: { index: false, follow: false } };

const InventoryPage = () => <InventoryManager />;

export default InventoryPage;
