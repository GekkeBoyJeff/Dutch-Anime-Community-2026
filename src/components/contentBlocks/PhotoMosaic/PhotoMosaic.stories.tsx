import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PhotoMosaic from './PhotoMosaic';
import { PhotoMosaicProps } from './PhotoMosaic.schema';

const meta: Meta<typeof PhotoMosaic> = {
	title: 'ContentBlocks/PhotoMosaic',
	component: PhotoMosaic,
	parameters: {
		docs: { description: { component: 'A community photo wall. `clean` is a tight rounded grid with hover zoom and caption overlay; `scrapbook` renders polaroid frames with slight rotations that straighten on hover.' } },
		jsonSchema: { schema: PhotoMosaicProps },
	},
};

export default meta;

type Story = StoryObj<typeof PhotoMosaic>;

export const Clean: Story = {
	args: {
		heading: { tagline: 'In pictures', title: 'The community up close' },
		items: [
			{
				id: 'm1',
				media: {
					type: 'image',
					src: '/media/demo.png',
					alt: 'Group photo',
				},
				caption: 'The crew together',
				span: 'wide',
			},
			{
				id: 'm2',
				media: {
					type: 'image',
					src: '/media/demo.png',
					alt: 'Board games',
				},
				caption: 'Game afternoon',
			},
			{
				id: 'm3',
				media: {
					type: 'image',
					src: '/media/demo.png',
					alt: 'Cosplay',
				},
				caption: 'Cosplay meet',
				span: 'tall',
			},
			{
				id: 'm4',
				media: {
					type: 'image',
					src: '/media/demo.png',
					alt: 'The stand',
				},
				caption: 'Our stand',
			},
			{
				id: 'm5',
				media: {
					type: 'image',
					src: '/media/demo.png',
					alt: 'Convention floor',
				},
				caption: 'On the con floor',
			},
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
