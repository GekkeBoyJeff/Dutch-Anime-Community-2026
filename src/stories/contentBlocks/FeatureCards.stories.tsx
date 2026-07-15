import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FeatureCards from '@/components/contentBlocks/FeatureCards';
import { FeatureCardsProps } from '@/lib/content/schema/blocks/featureCards';

const meta: Meta<typeof FeatureCards> = {
	title: 'ContentBlocks/FeatureCards',
	component: FeatureCards,
	parameters: {
		docs: { description: { component: 'Complete section with a heading group and a grid of cards. Receives all data via props and never fetches.' } },
		jsonSchema: { schema: FeatureCardsProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof FeatureCards>;

export const Default: Story = {
	args: {
		title: 'What you get',
		intro: 'A contentBlock that receives all its data via props.',
		items: [
			{ id: 'components', title: 'Components', body: 'A small set of primitives you compose every page from.' },
			{ id: 'content', title: 'Content as data', body: 'Pages are validated data, ready for a CMS.' },
			{ id: 'theming', title: 'Theming', body: 'Colour and typography cascade through tokens.' },
		],
	},
};

export const OnDark: Story = {
	...Default,
	args: {
		...Default.args,
		colorset: 'dark',
	},
};
