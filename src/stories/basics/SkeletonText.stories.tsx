import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SkeletonText from '@/components/basics/SkeletonText';
import { SkeletonTextProps } from '@/lib/content/schema/basics/skeletonText';

const meta: Meta<typeof SkeletonText> = {
	title: 'Basics/Skeleton/SkeletonText',
	component: SkeletonText,
	parameters: {
		docs: { description: { component: 'A stack of Skeleton lines for paragraph placeholders; the last line is shortened so the block reads like real copy.' } },
		jsonSchema: { schema: SkeletonTextProps },
	},
	argTypes: {
		lines: { control: { type: 'range', min: 1, max: 8, step: 1 } },
	},
};

export default meta;

type Story = StoryObj<typeof SkeletonText>;

export const Default: Story = {
	args: {
		lines: 3,
		lastWidth: '60%',
	},
};

export const Long: Story = {
	...Default,
	args: {
		...Default.args,
		lines: 5,
	},
};
