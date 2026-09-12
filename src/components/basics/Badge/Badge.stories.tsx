import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Badge from './Badge';
import { BadgeProps } from './Badge.schema';

const meta: Meta<typeof Badge> = {
	title: 'Basics/Badge',
	component: Badge,
	parameters: {
		docs: { description: { component: 'Static status/label chip — the non-interactive sibling of Pill. Variant tints come from the colorset and status tokens.' } },
		jsonSchema: { schema: BadgeProps },
	},
};

export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = {
	args: {
		value: 'New',
		variant: 'neutral',
	},
};

export const Primary: Story = {
	args: {
		...Default.args,
		variant: 'primary',
	},
};

export const Success: Story = {
	args: {
		...Default.args,
		variant: 'success',
		value: 'Active',
	},
};

export const WithDot: Story = {
	args: {
		...Default.args,
		variant: 'success',
		dot: true,
		value: 'Online',
	},
};

export const Outline: Story = {
	args: {
		...Default.args,
		variant: 'outline',
	},
};
