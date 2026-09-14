import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { demoImage } from '@/components/basics/Media/Media.stories';

import Avatar from './Avatar';
import { AvatarProps } from './Avatar.schema';

const meta: Meta<typeof Avatar> = {
	title: 'Basics/Avatar',
	component: Avatar,
	parameters: {
		docs: {
			description: {
				component: 'Circular avatar built on Media, with an optional presence dot and initials when there is no image. It has one size of its own (2.5rem); whoever places it sets another by putting `--avatar-size` on it in their own stylesheet.',
			},
		},
		jsonSchema: { schema: AvatarProps },
	},
	argTypes: {
		status: { control: 'inline-radio', options: [undefined, 'online', 'offline', 'busy'] },
	},
};

export default meta;

type Story = StoryObj<typeof Avatar>;

export const Default: Story = {
	args: {
		src: demoImage.src,
		alt: 'Portrait',
	},
};

export const WithStatus: Story = {
	args: {
		...Default.args,
		status: 'online',
	},
};

export const Fallback: Story = {
	args: {
		...Default.args,
		src: undefined,
		initials: 'JU',
	},
};
