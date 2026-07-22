import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ItemAvailabilityDrawer from '@/components/dashboard/inventory/ItemAvailabilityDrawer';

const meta: Meta<typeof ItemAvailabilityDrawer> = {
	title: 'Dashboard/Inventory/ItemAvailabilityDrawer',
	component: ItemAvailabilityDrawer,
	parameters: {
		docs: {
			description: {
				component:
					'One item\'s unavailability windows (`inventory.manage`): the existing windows with their status, approve/reject for the ones a member requested, plus a form to add a window that is active straight away. The drawer is open whenever `item` is set — passing `null` closes it.',
			},
		},
	},
	args: {
		item: { id: 'itm-3', name: 'Kassalade' },
	},
};

export default meta;

type Story = StoryObj<typeof ItemAvailabilityDrawer>;

export const Default: Story = {};
