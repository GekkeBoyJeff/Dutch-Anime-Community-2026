import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Avatar from '@/components/basics/Avatar';
import { AvatarProps } from '@/lib/site/content/schema/basics/avatar';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof Avatar> = {
	title: 'Basics/Avatar',
	component: Avatar,
	parameters: {
		docs: { description: { component: 'Circular avatar built on Media, with an optional presence dot and an initials fallback when there is no image.' } },
		jsonSchema: { schema: AvatarProps },
	},
	argTypes: {
		size: { control: 'inline-radio', options: ['s', 'm', 'l'] },
		src: { control: 'text' },
		status: { control: 'inline-radio', options: [undefined, 'online', 'offline', 'busy'] },
	},
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
	args: {
		src: demoImage.src,
		alt: 'Portrait',
		size: 'm',
	},
};

export const WithStatus: Story = {
	args: {
		...Default.args,
		status: 'online',
		size: 'l',
	},
};

export const Fallback: Story = {
	args: {
		...Default.args,
		src: undefined,
		initials: 'JU',
	},
};
