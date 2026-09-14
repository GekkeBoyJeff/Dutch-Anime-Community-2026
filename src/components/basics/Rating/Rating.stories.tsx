import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Rating from './Rating';
import { RatingProps } from './Rating.schema';

const meta: Meta<typeof Rating> = {
	title: 'Basics/Rating',
	component: Rating,
	parameters: {
		docs: { description: { component: 'A star rating out of `max`: filled stars in the accent, the remainder as outlines, and a half star for anything in between: any value above a whole star and below the next one shows as a half, so 4.1 and 4.7 both read as four and a half. The value is announced through one accessible label (`role="img"`); the star glyphs stay decorative. Reviews composes this — a block never hand-builds its own stars.' } },
		jsonSchema: { schema: RatingProps },
	},
};

export default meta;

type Story = StoryObj<typeof Rating>;

export const Default: Story = {
	args: {
		value: 4,
		ariaLabel: '4 van 5 sterren',
	},
};

export const Full: Story = {
	args: {
		value: 5,
		ariaLabel: '5 van 5 sterren',
	},
};

export const Half: Story = {
	args: {
		value: 4.5,
		ariaLabel: '4,5 van 5 sterren',
	},
};

export const CustomMax: Story = {
	args: {
		value: 7,
		max: 10,
		ariaLabel: '7 van 10',
	},
};
