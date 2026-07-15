import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Spinner from '@/components/basics/Spinner';
import { SpinnerProps } from '@/lib/content/schema/basics/spinner';

const meta: Meta<typeof Spinner> = {
	title: 'Basics/Spinner',
	component: Spinner,
	parameters: {
		docs: { description: { component: 'Inline async indicator (CSS-only). role="status" with an sr-only label; the spin respects prefers-reduced-motion.' } },
		jsonSchema: { schema: SpinnerProps },
	},
	argTypes: {
		size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
	},
};

export default meta;

type Story = StoryObj<typeof Spinner>;

export const Default: Story = {
	args: {
		size: 'm',
		label: 'Loading',
	},
};

export const Small: Story = {
	...Default,
	args: {
		...Default.args,
		size: 's',
	},
};

export const Large: Story = {
	...Default,
	args: {
		...Default.args,
		size: 'l',
	},
};
