import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Indicator from '@/components/basics/Indicator';
import { IndicatorProps } from '@/lib/site/content/schema/basics/indicator';

const meta: Meta<typeof Indicator> = {
	title: 'Basics/Indicator',
	component: Indicator,
	parameters: {
		docs: { description: { component: 'Positions a dot or count badge in the corner of the host element it is placed on (notification badge, online status). Pair with VisuallyHidden on the host for an accessible count.' } },
		jsonSchema: { schema: IndicatorProps },
	},
	argTypes: {
		position: { control: 'inline-radio', options: ['top-end', 'top-start', 'bottom-end', 'bottom-start'] },
		variant: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'error'] },
	},
};

export default meta;

type Story = StoryObj<typeof Indicator>;

export const Default: Story = {
	args: {
		count: 3,
		position: 'top-end',
		variant: 'primary',
	},
};

export const Dot: Story = {
	args: {
		...Default.args,
		count: undefined,
		variant: 'success',
	},
};
