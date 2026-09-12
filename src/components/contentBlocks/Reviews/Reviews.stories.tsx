import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Reviews from './Reviews';
import { ReviewsProps } from './Reviews.schema';

const meta: Meta<typeof Reviews> = {
	title: 'ContentBlocks/Reviews',
	component: Reviews,
	parameters: {
		docs: { description: { component: 'Grid of reviews; the accompanying rich-snippet data (JSON-LD) is derived from the same block data via the builder in lib/seo.' } },
		jsonSchema: { schema: ReviewsProps },
	},
};

export default meta;

type Story = StoryObj<typeof Reviews>;

export const Default: Story = {
	args: {
		title: 'What others say',
		items: [
			{
				id: 'r1',
				author: 'Sara',
				rating: 5,
				value: 'My new site was live in an afternoon.',
			},
			{
				id: 'r2',
				author: 'Daan',
				rating: 5,
				value: 'The structure is clear and easy to extend.',
			},
			{
				id: 'r3',
				author: 'Noor',
				rating: 4,
				value: 'A solid base with well-designed components.',
			},
		],
	},
};
