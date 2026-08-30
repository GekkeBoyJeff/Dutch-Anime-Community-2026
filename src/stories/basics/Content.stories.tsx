import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Content from '@/components/basics/Content';
import { ContentProps } from '@/lib/site/content/schema/basics/content';

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

export const Default: Story = {
	args: {
		value: 'Body copy that can carry <strong>inline HTML</strong>, sanitised before it renders.',
		size: 'standard',
	},
};

export const Small: Story = {
	args: {
		...Default.args,
		size: 'small',
	},
};

export const Large: Story = {
	args: {
		...Default.args,
		size: 'large',
	},
};
