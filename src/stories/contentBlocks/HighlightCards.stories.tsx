import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HighlightCards from '@/components/contentBlocks/HighlightCards';
import { HighlightCardsProps } from '@/lib/content/schema/blocks/highlightCards';
import { demoImage } from '@/stories/basics/Media.stories';

const photo = demoImage;

const meta: Meta<typeof HighlightCards> = {
	title: 'ContentBlocks/HighlightCards',
	component: HighlightCards,
	parameters: {
		docs: { description: { component: 'Polaroid-style numbered photo cards with floating badges, tagline, title, body and a row of actions. Presentational — all data arrives via props.' } },
		jsonSchema: { schema: HighlightCardsProps },
	},
	argTypes: {
		columns: { control: 'inline-radio', options: [2, 3, 4] },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof HighlightCards>;

export const Default: Story = {
	args: {
		heading: { value: 'Highlights', tagline: 'This season', intro: 'A few things worth a closer look.' },
		columns: 3,
		items: [
			{ id: 'h1', media: photo, badges: ['New'], tagline: 'Series', title: 'Spring picks', text: 'Hand-chosen favourites for the new season.', actions: [{ label: 'Explore' }] },
			{ id: 'h2', media: photo, badges: ['Popular'], tagline: 'Series', title: 'Crowd favourites', text: 'What everyone has been watching lately.' },
			{ id: 'h3', media: photo, tagline: 'Series', title: 'Hidden gems', text: 'Quieter releases you might have missed.', actions: [{ label: 'See all', variant: 'ghost' }] },
		],
	},
};

export const TwoColumns: Story = {
	...Default,
	args: {
		...Default.args,
		columns: 2,
	},
};
