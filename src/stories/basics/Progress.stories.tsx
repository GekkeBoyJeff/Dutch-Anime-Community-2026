import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Progress from '@/components/basics/Progress';
import { ProgressProps } from '@/lib/content/schema/basics/progress';

const meta: Meta<typeof Progress> = {
	title: 'Basics/Progress',
	component: Progress,
	parameters: {
		docs: { description: { component: 'Linear progress bar with role="progressbar". A `value` makes it determinate; omitting it gives an indeterminate sweep (motion-gated).' } },
		jsonSchema: { schema: ProgressProps },
	},
	argTypes: {
		value: { control: { type: 'range', min: 0, max: 100, step: 1 } },
		size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
	},
};

export default meta;

type Story = StoryObj<typeof Progress>;

export const Default: Story = {
	args: {
		value: 60,
		label: 'Upload progress',
		size: 'm',
	},
};

export const Indeterminate: Story = {
	...Default,
	args: {
		...Default.args,
		value: undefined,
	},
};
