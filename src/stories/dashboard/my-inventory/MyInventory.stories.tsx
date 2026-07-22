import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MyInventory from '@/components/dashboard/my-inventory/MyInventory';

const meta: Meta<typeof MyInventory> = {
	title: 'Dashboard/MyInventory/MyInventory',
	component: MyInventory,
	parameters: {
		docs: {
			description: {
				component:
					'The personal side of the inventory (`inventory.view`, so Standteam sees this too): your own items with an availability switch and an "onbeschikbaar melden" flow, a card per convention showing what you must bring and which tickets you hold, and your shift agenda underneath. The reported-windows list inside the drawer is an Entry list — status badge and Intrekken sit in its trailing slot.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof MyInventory>;

export const Default: Story = {};
