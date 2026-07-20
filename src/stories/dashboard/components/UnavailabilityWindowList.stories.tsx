import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import UnavailabilityWindowList, { type UnavailabilityWindow } from '@/components/dashboard/components/UnavailabilityWindowList';

const noop = () => {};

const windows: UnavailabilityWindow[] = [
	{ id: 'w1', starts_on: '2026-08-15', ends_on: '2026-08-17', reason: 'Eigen gebruik op de con', status: 'active' },
	{ id: 'w2', starts_on: '2026-09-01', ends_on: null, reason: null, status: 'requested' },
	{ id: 'w3', starts_on: '2026-07-01', ends_on: '2026-07-03', reason: 'Reparatie', status: 'rejected' },
];

const meta: Meta<typeof UnavailabilityWindowList> = {
	title: 'Dashboard/Components/UnavailabilityWindowList',
	component: UnavailabilityWindowList,
	parameters: {
		docs: {
			description: {
				component:
					"A list of an item's unavailability windows: date range over an optional reason, with a status badge and — when the callbacks are given — approve/reject (for a requested window) and remove actions. Read-only when no callbacks are supplied.",
			},
		},
	},
	args: { windows },
	decorators: [(Story) => <div className="inventory-form"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof UnavailabilityWindowList>;

export const Default: Story = {
	args: { onDecide: noop, onRemove: noop },
};

export const ReadOnly: Story = {
	name: 'Alleen-lezen',
};

export const Empty: Story = {
	name: 'Leeg',
	args: { windows: [] },
};

export const SingleWindow: Story = {
	name: 'Eén venster',
	args: { windows: [windows[0]!], onRemove: noop },
};
