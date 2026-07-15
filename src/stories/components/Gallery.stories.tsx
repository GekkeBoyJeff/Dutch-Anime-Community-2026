import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Gallery from '@/components/components/Gallery';
import { GalleryProps } from '@/lib/content/schema/components/gallery';
import { demoImage } from '@/stories/basics/Media.stories';

const items = [
	{ ...demoImage, caption: 'Eerste foto', credit: '© Fotograaf' },
	{ ...demoImage, caption: 'Tweede foto' },
	demoImage,
	{ ...demoImage, caption: 'Vierde foto', url: '/' },
	demoImage,
	{ ...demoImage, credit: '© Studio' },
];

const meta: Meta<typeof Gallery> = {
	title: 'Components/Gallery',
	component: Gallery,
	parameters: {
		docs: {
			description: {
				component:
					'Image gallery in masonry, grid or strip layouts. Fully server-rendered: each item is a `<figure>` from the Media primitive with optional caption, credit and link. The column count drives a --columns custom property.',
			},
		},
		jsonSchema: { schema: GalleryProps },
	},
	argTypes: {
		variant: { control: 'inline-radio', options: ['masonry', 'grid', 'strip'] },
		columns: { control: { type: 'range', min: 1, max: 5, step: 1 } },
		gap: { control: 'inline-radio', options: ['s', 'm', 'l', 'xl'] },
	},
};

export default meta;

type Story = StoryObj<typeof Gallery>;

export const Default: Story = {
	args: {
		items,
		variant: 'grid',
		columns: 3,
		gap: 'm',
	},
};

export const Masonry: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'masonry'
	}
};

export const Strip: Story = {
	...Default,
	args: {
		...Default.args,
		variant: 'strip'
	}
};

export const TwoColumns: Story = {
	...Default,
	args: {
		...Default.args,
		columns: 2
	}
};
