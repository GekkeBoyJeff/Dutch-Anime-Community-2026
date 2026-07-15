import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Pill from '@/components/basics/Pill';
import { PillProps } from '@/lib/content/schema/basics/pill';

const meta: Meta<typeof Pill> = {
	title: 'Basics/Pill',
	component: Pill,
	parameters: {
		docs: { description: { component: 'Compact, rounded clickable variant (tags, filters), built on top of Interactive.' } },
		jsonSchema: { schema: PillProps },
	},
};

export default meta;

type Story = StoryObj<typeof Pill>;

export const Default: Story = {
	args: {
		children: 'Series',
		active: false,
	},
};

export const Active: Story = {
	...Default,
	args: {
		...Default.args,
		active: true,
		children: 'All',
	},
};
