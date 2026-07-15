import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import SpotlightQuote from '@/components/contentBlocks/SpotlightQuote';
import { SpotlightQuoteProps } from '@/lib/content/schema/blocks/spotlightQuote';

const meta: Meta<typeof SpotlightQuote> = {
	title: 'ContentBlocks/SpotlightQuote',
	component: SpotlightQuote,
	parameters: {
		docs: { description: { component: 'One oversized quote on a tinted band, with an optional mascot that pops in at the edge as the band scrolls into view — a single playful reward moment per page.' } },
		jsonSchema: { schema: SpotlightQuoteProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof SpotlightQuote>;

export const Default: Story = {
	args: {
		quote: 'I met some of my best friends here. It helped me be myself — and now I even dare to go to conventions.',
		author: 'Pejowo',
		role: 'member review on Disboard',
	},
};

export const WithMascot: Story = {
	...Default,
	args: {
		...Default.args,
		mascot: { type: 'image', src: '/media/amelia-smile.webp', alt: '', mode: 'fit', ratio: '1 / 1' },
	},
};
