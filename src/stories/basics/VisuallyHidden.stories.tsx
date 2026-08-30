import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import VisuallyHidden from '@/components/basics/VisuallyHidden';
import { VisuallyHiddenProps } from '@/lib/site/content/schema/basics/visuallyHidden';

const meta: Meta<typeof VisuallyHidden> = {
	title: 'Basics/VisuallyHidden',
	component: VisuallyHidden,
	parameters: {
		docs: { description: { component: 'Hides content visually while keeping it for screen readers — icon-button labels, skip links, live-region text. Renders the global `.sr-only` utility.' } },
		jsonSchema: { schema: VisuallyHiddenProps },
	},
};

export default meta;

type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
	args: {
		value: 'Screen-reader only label',
	},
};

export const InsideButton: Story = {
	...Default,
	args: {
		...Default.args,
		value: 'Add to favourites',
	},
	decorators: [
		(Story) => (
			<button type="button">
				<span aria-hidden="true">★</span>
				<Story />
			</button>
		),
	],
};
