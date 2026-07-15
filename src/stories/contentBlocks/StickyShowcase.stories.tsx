import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StickyShowcase from '@/components/contentBlocks/StickyShowcase';
import { StickyShowcaseProps } from '@/lib/content/schema/blocks/stickyShowcase';

const meta: Meta<typeof StickyShowcase> = {
	title: 'ContentBlocks/StickyShowcase',
	component: StickyShowcase,
	parameters: {
		docs: { description: { component: 'Apple-style scroll showcase: the media stage pins while steps scroll past, crossfading the stage image per active step. On small screens the stage unpins and each step shows its own media.' } },
		jsonSchema: { schema: StickyShowcaseProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof StickyShowcase>;

export const Default: Story = {
	args: {
		heading: { tagline: 'How it works', value: 'Three steps to join' },
		steps: [
			{ id: 'st1', title: 'Join the server', body: 'One click and you are in — free, no strings attached.', media: { type: 'image', src: '/media/demo.png', alt: 'Joining the server' } },
			{ id: 'st2', title: 'Pick your roles', body: 'Choose the topics you care about and see exactly the channels that fit.', media: { type: 'image', src: '/media/demo.png', alt: 'Picking roles' } },
			{ id: 'st3', title: 'Say hi', body: 'Introduce yourself and get your first conversation within the hour.', media: { type: 'image', src: '/media/demo.png', alt: 'Saying hi' } },
		],
	},
};
