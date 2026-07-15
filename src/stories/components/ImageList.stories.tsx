import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ImageList from '@/components/components/ImageList';
import { ImageListProps } from '@/lib/content/schema/components/imageList';
import { demoImage } from '@/stories/basics/Media.stories';

// Six of the same demo asset — the story shows the list layout, and alt comes from demoImage.
const items = Array.from({ length: 6 }, () => demoImage);

const meta: Meta<typeof ImageList> = {
	title: 'Components/ImageList',
	component: ImageList,
	parameters: {
		docs: {
			description: {
				component:
					'Grid/featured/masonry/mosaic arrangement of Media items — the simpler sibling of Gallery (no captions or links). Shared mediaOptions are spread first, then each item overrides them. Fully server-rendered.',
			},
		},
		jsonSchema: { schema: ImageListProps },
	},
	argTypes: {
		layout: { control: 'inline-radio', options: ['grid', 'featured', 'masonry', 'mosaic'] },
		columns: { control: 'inline-radio', options: [2, 3, 4] },
	},
};

export default meta;

type Story = StoryObj<typeof ImageList>;

export const Default: Story = {
	args: {
		items,
		mediaOptions: { ratio: '4 / 3' },
		layout: 'grid',
		columns: 3,
	},
};

export const Featured: Story = {
	...Default,
	args: {
		...Default.args,
		layout: 'featured'
	}
};

export const Masonry: Story = {
	...Default,
	args: {
		...Default.args,
		layout: 'masonry',
		mediaOptions: undefined
	}
};

export const Mosaic: Story = {
	...Default,
	args: {
		...Default.args,
		layout: 'mosaic'
	}
};

export const FourColumns: Story = {
	...Default,
	args: {
		...Default.args,
		columns: 4
	}
};
