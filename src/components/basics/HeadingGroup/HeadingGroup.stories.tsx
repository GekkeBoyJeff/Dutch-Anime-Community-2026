import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HeadingGroup from './HeadingGroup';
import { HeadingGroupProps } from './HeadingGroup.schema';

const meta: Meta<typeof HeadingGroup> = {
	title: 'Basics/HeadingGroup',
	component: HeadingGroup,
	parameters: {
		docs: {
			description: {
				component: 'Tagline + Title + intro cluster — the section heading composite blocks open with. Renders nothing when empty.',
			},
		},
		jsonSchema: { schema: HeadingGroupProps },
	},
	argTypes: {
		size: {
			control: {
				type: 'range',
				min: 1,
				max: 6,
				step: 1,
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof HeadingGroup>;

export const Default: Story = {
	args: {
		tagline: 'Why us',
		title: 'Everything you need to ship',
		intro: 'A short supporting line that sets up the section below it.',
		size: 2,
		orientation: 'normal',
	},
};

export const Reversed: Story = {
	args: {
		...Default.args,
		orientation: 'reversed',
	},
};

export const Split: Story = {
	args: {
		...Default.args,
		intro: 'The intro moves into a column of its own beside the title, six of the twelve columns wide. Below the desktop breakpoint the cluster stacks again.',
		orientation: 'split',
		actions: [
			{
				value: 'Contact us',
				variant: 'primary',
				url: '/contact',
			},
			{
				value: 'Learn more',
				variant: 'secondary',
				url: '/about',
			},
		],
	},
};
