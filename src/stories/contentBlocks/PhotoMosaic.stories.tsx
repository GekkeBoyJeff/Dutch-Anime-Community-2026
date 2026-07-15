import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PhotoMosaic from '@/components/contentBlocks/PhotoMosaic';
import { PhotoMosaicProps } from '@/lib/content/schema/blocks/photoMosaic';

const meta: Meta<typeof PhotoMosaic> = {
	title: 'ContentBlocks/PhotoMosaic',
	component: PhotoMosaic,
	parameters: {
		docs: { description: { component: 'A community photo wall. `clean` is a tight rounded grid with hover zoom and caption overlay; `scrapbook` renders polaroid frames with slight rotations that straighten on hover.' } },
		jsonSchema: { schema: PhotoMosaicProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
		variant: {
			control: 'inline-radio',
			options: ['clean', 'scrapbook'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof PhotoMosaic>;

export const Clean: Story = {
	args: {
		heading: { tagline: 'In pictures', value: 'The community up close' },
		items: [
			{ id: 'm1', media: { type: 'image', src: '/media/demo.png', alt: 'Group photo' }, caption: 'The crew together', span: 'wide' },
			{ id: 'm2', media: { type: 'image', src: '/media/demo.png', alt: 'Board games' }, caption: 'Game afternoon' },
			{ id: 'm3', media: { type: 'image', src: '/media/demo.png', alt: 'Cosplay' }, caption: 'Cosplay meet', span: 'tall' },
			{ id: 'm4', media: { type: 'image', src: '/media/demo.png', alt: 'The stand' }, caption: 'Our stand' },
			{ id: 'm5', media: { type: 'image', src: '/media/demo.png', alt: 'Convention floor' }, caption: 'On the con floor' },
		],
	},
};

export const Scrapbook: Story = {
	...Clean,
	args: {
		...Clean.args,
		variant: 'scrapbook',
	},
};
