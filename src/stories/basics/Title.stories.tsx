import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Title from '@/components/basics/Title';
import { TitleProps } from '@/lib/site/content/schema/basics/title';

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

export const Default: Story = {
	args: {
		value: 'Example Brand',
		size: 1,
	},
};

export const SmallerSizeThanTag: Story = {
	args: {
		...Default.args,
		element: 'h2',
		size: 4,
	},
};

export const WithoutHeadingTag: Story = {
	args: {
		...Default.args,
		element: 'p',
		size: 3,
	},
	parameters: {
		docs: { description: { story: 'Title styling on a non-heading tag: a `<p>` that looks like a size-3 title but adds no heading to the document outline — for when the visual is wanted but a heading level would be semantically wrong.' } },
	},
};
