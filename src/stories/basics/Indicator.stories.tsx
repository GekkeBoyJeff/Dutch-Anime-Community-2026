import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Indicator from '@/components/basics/Indicator';
import { IndicatorProps } from '@/lib/content/schema/basics/indicator';

// A neutral square stands in for the host element (Avatar, Icon, Button) the indicator attaches to.
const anchor = <span style={{ display: 'inline-block', width: '40px', height: '40px', borderRadius: '8px', background: '#888' }} />;

const meta: Meta<typeof Indicator> = {
	title: 'Basics/Indicator',
	component: Indicator,
	parameters: {
		docs: { description: { component: 'Positions a dot or count badge over its child (notification badge, online status). Pair with VisuallyHidden on the host for an accessible count.' } },
		jsonSchema: { schema: IndicatorProps },
	},
	argTypes: {
		position: { control: 'inline-radio', options: ['top-end', 'top-start', 'bottom-end', 'bottom-start'] },
		variant: { control: 'inline-radio', options: ['primary', 'success', 'warning', 'error'] },
	},
	render: (args) => <Indicator {...args}>{anchor}</Indicator>,
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
	...Default,
	args: {
		...Default.args,
		count: undefined,
		variant: 'success',
	},
};
