import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ShinyText from './ShinyText';
import { ShinyTextProps } from './ShinyText.schema';

const meta: Meta<typeof ShinyText> = {
	title: 'Basics/ShinyText',
	component: ShinyText,
	parameters: {
		docs: { description: { component: 'A sweeping highlight across text, done purely in CSS (background-clip: text). The sweep respects prefers-reduced-motion; `disabled` opts out.' } },
		jsonSchema: { schema: ShinyTextProps },
	},
};

export default meta;

type Story = StoryObj<typeof ShinyText>;

export const Default: Story = {
	args: {
		value: 'Shiny by default',
		speed: 'normal',
		disabled: false,
	},
};

export const Slow: Story = {
	args: {
		...Default.args,
		speed: 'slow',
	},
};

export const Disabled: Story = {
	args: {
		...Default.args,
		disabled: true,
	},
};
