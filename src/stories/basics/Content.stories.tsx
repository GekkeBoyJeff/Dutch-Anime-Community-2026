import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Content from '@/components/basics/Content';
import { ContentProps } from '@/lib/content/schema/basics/content';

const meta: Meta<typeof Content> = {
	title: 'Basics/Content',
	component: Content,
	parameters: {
		docs: { description: { component: 'Running text with the body role. `size` picks a responsive curve: `standard` (default, no class), `small`, or `large` — never a fixed size. `value` may contain HTML.' } },
		jsonSchema: { schema: ContentProps },
	},
	argTypes: {
		size: {
			control: 'inline-radio',
			options: ['small', 'standard', 'large'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Content>;

// Standard body — the default; carries no size modifier class.
export const Default: Story = {
	args: {
		value: 'Waar de Nederlandse anime-community samenkomt — <strong>op Discord en op events</strong>.',
		size: 'standard',
	},
};

export const Small: Story = {
	...Default,
	args: {
		...Default.args,
		size: 'small',
	},
};

// A larger lead/intro curve.
export const Large: Story = {
	...Default,
	args: {
		...Default.args,
		size: 'large',
	},
};
