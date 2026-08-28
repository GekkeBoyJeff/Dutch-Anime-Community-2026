import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BentoGrid from '@/components/contentBlocks/BentoGrid';
import { BentoGridProps } from '@/lib/site/content/schema/blocks/bentoGrid';
import { demoImage } from '@/stories/basics/Media.stories';

const photo = demoImage;

const meta: Meta<typeof BentoGrid> = {
	title: 'ContentBlocks/BentoGrid',
	component: BentoGrid,
	parameters: {
		docs: { description: { component: 'Magazine-style asymmetric grid of tiles with span (feature/wide/tall/standard) and surface variants. A tile with an href becomes one big clickable link.' } },
		jsonSchema: { schema: BentoGridProps },
	},
	argTypes: {
		columns: { control: 'inline-radio', options: [3, 4, 5, 6] },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof BentoGrid>;

export const Default: Story = {
	args: {
		heading: { title: 'Explore the platform', tagline: 'Overview', intro: 'A tour of what you can build, laid out like a magazine spread.' },
		columns: 4,
		items: [
			{ id: 'b1', span: 'feature', media: photo, tagline: 'Featured', title: 'The big idea', value: 'A photo-led tile that anchors the grid.', cta: { value: 'Read more' }, href: '#' },
			{ id: 'b2', span: 'standard', surface: 'accent', tagline: 'Speed', title: 'Fast by default', value: 'Server Components and streaming.' },
			{ id: 'b3', span: 'standard', surface: 'muted', tagline: 'Typed', title: 'Content as data', value: 'Validated, ready for a CMS.' },
			{ id: 'b4', span: 'wide', surface: 'inverse', tagline: 'Themeable', title: 'One token cascade', value: 'Colour and type flow from tokens.' },
			{ id: 'b5', span: 'tall', media: photo, tagline: 'Media', title: 'Rich media', value: 'Images, video and embeds in one component.' },
			{ id: 'b6', span: 'standard', title: 'Accessible', value: 'Keyboard and screen-reader first.' },
		],
	},
};

export const SixColumns: Story = {
	...Default,
	args: {
		...Default.args,
		columns: 6,
	},
};
