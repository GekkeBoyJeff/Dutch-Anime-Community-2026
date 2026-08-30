import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Meter from '@/components/components/Meter';

const meta: Meta<typeof Meter> = {
	title: 'Components/Meter',
	component: Meter,
	parameters: {
		docs: {
			description: {
				component: 'Progress towards a whole, as a bar or a ring. Reaching max is treated as an event: the readout swaps for a gold seal.',
			},
		},
	},
	argTypes: {
		shape: { control: 'inline-radio', options: ['bar', 'ring'] },
		tone: { control: 'inline-radio', options: ['neutral', 'positive', 'warning', 'negative'] },
		loading: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Meter>;

export const Bar: Story = {
	args: { label: 'Ingepakt', value: 6, max: 10 },
};

export const Complete: Story = {
	args: { label: 'Ingepakt', value: 10, max: 10, completeLabel: 'Alles ingepakt' },
};

export const Warning: Story = {
	args: { label: 'Shifts gevuld', value: 3, max: 12, tone: 'warning' },
};

export const Ring: Story = {
	args: { label: 'Budget besteed', value: 780, max: 1000, shape: 'ring', valueLabel: '78%' },
};

export const Empty: Story = {
	args: { label: 'Ingepakt', value: 0, max: 10 },
};

export const ZeroMax: Story = {
	args: { label: 'Geen items', value: 0, max: 0 },
};

export const Loading: Story = {
	args: { label: 'Ingepakt', value: 6, max: 10, loading: true },
};
