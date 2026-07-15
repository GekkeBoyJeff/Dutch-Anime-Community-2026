import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Icon from '@/components/basics/Icon';
import { IconProps } from '@/lib/content/schema/basics/icon';

const meta: Meta<typeof Icon> = {
	title: 'Basics/Icon',
	component: Icon,
	parameters: {
		docs: { description: { component: 'A single icon glyph by name; decorative (aria-hidden). Glyphs appear once the icon font has been added.' } },
		jsonSchema: { schema: IconProps },
	},
	argTypes: {
		name: {
			control: 'inline-radio',
			options: ['search', 'close', 'menu', 'heart'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Icon>;

export const Default: Story = {
	args: {
		name: 'search',
	},
};
