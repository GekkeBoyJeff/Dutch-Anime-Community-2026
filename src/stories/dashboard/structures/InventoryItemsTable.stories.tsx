import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import type { PersonOption } from '@/components/dashboard/forms/PersonPicker';
import InventoryItemsTable, { type InventoryItem } from '@/components/dashboard/structures/InventoryItemsTable';

const users: PersonOption[] = [
	{ id: 'u1', username: 'Jeffrey' },
	{ id: 'u2', username: 'Mila' },
];

const items: InventoryItem[] = [
	{ id: 'i1', name: 'Beamer', owner_user_id: 'u1', owner_label: null, quantity: 1, value_eur: 650, available: true, notes: null, archived_at: null },
	{ id: 'i2', name: 'Statafels (set)', owner_user_id: null, owner_label: 'Vereniging', quantity: 8, value_eur: 240, available: true, notes: null, archived_at: null },
	{ id: 'i3', name: 'Geluidsset', owner_user_id: 'u2', owner_label: null, quantity: 1, value_eur: 1200, available: false, notes: null, archived_at: null },
];

const noop = () => {};

const meta: Meta<typeof InventoryItemsTable> = {
	title: 'Dashboard/Structures/InventoryItemsTable',
	component: InventoryItemsTable,
	parameters: {
		docs: {
			description: {
				component:
					'The inventory items table: name, owner, quantity, value, a derived availability badge (unavailable / active window / available, plus an open-request dot) and per-row edit/archive/delete/availability actions. The caller owns the data, the availability sets and every mutation.',
			},
		},
	},
	args: {
		users,
		unavailTodayIds: new Set<string>(),
		pendingRequestIds: new Set<string>(),
		canHardDelete: false,
		empty: { title: 'Geen items gevonden', description: 'Voeg je eerste item toe.' },
		onEdit: noop,
		onArchive: noop,
		onDelete: noop,
		onAvailability: noop,
	},
};

export default meta;

type Story = StoryObj<typeof InventoryItemsTable>;

export const Default: Story = {
	args: { items },
};

export const WithWindowsAndRequests: Story = {
	name: 'Met vensters en verzoeken',
	args: {
		items,
		unavailTodayIds: new Set(['i1']),
		pendingRequestIds: new Set(['i2']),
		canHardDelete: true,
	},
};

export const Empty: Story = {
	name: 'Leeg',
	args: { items: [] },
};
