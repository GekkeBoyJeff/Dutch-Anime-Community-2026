import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Rating from '@/components/basics/Rating';
import { RatingProps } from '@/lib/content/schema/basics/rating';

const meta: Meta<typeof Rating> = {
	title: 'Basics/Rating',
	component: Rating,
	parameters: {
		docs: { description: { component: 'A star rating out of `max`: filled stars in the accent, the remainder as outlines. The value is announced through one accessible label (`role="img"`); the star glyphs stay decorative. Reviews composes this — a block never hand-builds its own stars.' } },
		jsonSchema: { schema: RatingProps },
	},
};

export default meta;

type Story = StoryObj<typeof Rating>;

export const Default: Story = {
	args: {
		value: 4,
		label: '4 van 5 sterren',
	},
};

export const Full: Story = {
	...Default,
	args: {
		value: 5,
		label: '5 van 5 sterren',
	},
};

export const CustomMax: Story = {
	...Default,
	args: {
		value: 7,
		max: 10,
		label: '7 van 10',
	},
};
