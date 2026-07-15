import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HeadingGroup from '@/components/basics/HeadingGroup';
import { HeadingGroupProps } from '@/lib/content/schema/basics/headingGroup';

const meta: Meta<typeof HeadingGroup> = {
	title: 'Basics/HeadingGroup',
	component: HeadingGroup,
	parameters: {
		docs: { description: { component: 'Tagline + Title + intro cluster — the section heading composite blocks open with. Renders nothing when empty.' } },
		jsonSchema: { schema: HeadingGroupProps },
	},
	argTypes: {
		size: { control: { type: 'range', min: 1, max: 6, step: 1 } },
		orientation: { control: 'inline-radio', options: ['normal', 'reversed'] },
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
	...Default,
	args: {
		...Default.args,
		orientation: 'reversed',
	},
};
