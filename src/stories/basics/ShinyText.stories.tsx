import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ShinyText from '@/components/basics/ShinyText';
import { ShinyTextProps } from '@/lib/site/content/schema/basics/shinyText';

const meta: Meta<typeof ShinyText> = {
	title: 'Basics/ShinyText',
	component: ShinyText,
	parameters: {
		docs: { description: { component: 'A sweeping highlight across text, done purely in CSS (background-clip: text). The sweep respects prefers-reduced-motion; `disabled` opts out.' } },
		jsonSchema: { schema: ShinyTextProps },
	},
	argTypes: {
		speed: { control: { type: 'range', min: 1, max: 8, step: 0.5 } },
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
