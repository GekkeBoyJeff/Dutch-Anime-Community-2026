import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import InventoryManager from '@/components/dashboard/inventory/InventoryManager';

const meta: Meta<typeof InventoryManager> = {
	title: 'Dashboard/Inventory/InventoryManager',
	component: InventoryManager,
	parameters: {
		docs: {
			description: {
				component:
					'The shared inventory (`inventory.manage`): every item with its owner, quantity, value and a derived availability badge — an item is only really available when its `available` flag is set *and* no active unavailability window covers today. Filter on availability or open requests, search by name or owner, and toggle archived rows into view. Hard delete only appears with `records.delete` (Beheerder).',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof InventoryManager>;

export const Default: Story = {};
