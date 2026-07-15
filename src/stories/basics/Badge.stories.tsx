import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Badge from '@/components/basics/Badge';
import { BadgeProps } from '@/lib/content/schema/basics/badge';

const meta: Meta<typeof Badge> = {
	title: 'Basics/Badge',
	component: Badge,
	parameters: {
		docs: { description: { component: 'Static status/label chip — the non-interactive sibling of Pill. Variant tints come from the colorset and status tokens.' } },
		jsonSchema: { schema: BadgeProps },
	},
	argTypes: {
		variant: {
			control: 'inline-radio',
			options: ['neutral', 'primary', 'info', 'success', 'warning', 'error', 'outline'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
	args: {
		children: 'New',
		variant: 'neutral',
	},
};

export const Primary: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'primary',
	},
};

export const Success: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'success',
		children: 'Active',
	},
};

export const WithDot: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'success',
		dot: true,
		children: 'Online',
	},
};

export const Outline: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'outline',
	},
};
