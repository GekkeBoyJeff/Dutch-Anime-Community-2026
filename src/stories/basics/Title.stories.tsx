import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Title from '@/components/basics/Title';
import { TitleProps } from '@/lib/content/schema/basics/title';

const meta: Meta<typeof Title> = {
	title: 'Basics/Title',
	component: Title,
	parameters: {
		docs: { description: { component: 'A heading where two things are independent: `size` (1–6) picks the responsive type role via the `.is-N` class, and `element` picks the HTML tag. So you can give an `<h2>` the h4 visual size, or render the title styling on a non-heading tag like `<p>`.' } },
		jsonSchema: { schema: TitleProps },
	},
	argTypes: {
		size: {
			control: { type: 'range', min: 1, max: 6, step: 1 },
		},
		element: {
			control: 'select',
			options: [undefined, 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'div'],
			description: 'The HTML tag. Omit to default to h{size}.',
		},
	},
};

export default meta;

type Story = StoryObj<typeof Title>;

// Default: no `element`, so the tag follows the size (size 1 → <h1>).
export const Default: Story = {
	args: {
		value: 'Dutch Anime Community',
		size: 1,
	},
};

// size and tag are independent: this is an <h2> element that carries the h4 visual size.
export const SmallerSizeThanTag: Story = {
	...Default,
	args: {
		...Default.args,
		element: 'h2',
		size: 4,
	},
};

// Title styling on a NON-heading tag: a <p> that looks like a size-3 title but adds no heading to the
// document outline (use when the visual is wanted but a heading level would be semantically wrong).
export const WithoutHeadingTag: Story = {
	...Default,
	args: {
		...Default.args,
		element: 'p',
		size: 3,
	},
};
