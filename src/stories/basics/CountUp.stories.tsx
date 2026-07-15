import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import CountUp from '@/components/basics/CountUp';

const meta: Meta<typeof CountUp> = {
	title: 'Basics/CountUp',
	component: CountUp,
	parameters: {
		docs: { description: { component: 'Counts up to `value` once the number scrolls into view, with an easeOutExpo curve and nl-NL formatting. Server-rendered at its final value, so crawlers and no-JS visitors read real data; reduced motion keeps the final value untouched. Stat composes this for numeric values — blocks don\'t animate numbers themselves.' } },
	},
};

export default meta;

type Story = StoryObj<typeof CountUp>;

export const Default: Story = {
	args: {
		value: 4500,
		suffix: '+',
	},
};

export const LargeNumber: Story = {
	...Default,
	args: {
		value: 1250000,
	},
};

export const Decimals: Story = {
	...Default,
	args: {
		value: 4.8,
		decimals: 1,
		suffix: ' / 5',
	},
};
