import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import GrowingMediaOnScroll from '@/components/contentBlocks/GrowingMediaOnScroll';
import { GrowingMediaOnScrollProps } from '@/lib/content/schema/blocks/growingMediaOnScroll';

const meta: Meta<typeof GrowingMediaOnScroll> = {
	title: 'ContentBlocks/GrowingMediaOnScroll',
	component: GrowingMediaOnScroll,
	parameters: {
		docs: { description: { component: 'A media panel that grows from a small card to (nearly) full-bleed while scrolling — pure CSS scroll-driven animation, zero JavaScript. Browsers without support show the full-size panel.' } },
		jsonSchema: { schema: GrowingMediaOnScrollProps },
	},
	argTypes: {
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof GrowingMediaOnScroll>;

export const Default: Story = {
	args: {
		heading: { tagline: 'Proef de sfeer', value: 'Eén scroll zegt alles' },
		media: { type: 'image', src: '/media/dac-meetup.png', alt: 'DAC-leden samen op een meetup' },
		caption: 'Scroll om het paneel te zien groeien.',
	},
};

// The media prop is the shared Media primitive, so a native video grows along the same timeline.
export const Video: Story = {
	...Default,
	args: {
		...Default.args,
		media: { type: 'video', src: '/media/demo.mp4', alt: 'Sfeerimpressie van een meetup' },
		caption: 'Ook video groeit mee — native, met eigen controls.',
	},
};
