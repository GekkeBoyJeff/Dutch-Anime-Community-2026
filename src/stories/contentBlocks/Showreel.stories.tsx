import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Showreel from '@/components/contentBlocks/Showreel';
import { ShowreelProps } from '@/lib/content/schema/blocks/showreel';

const meta: Meta<typeof Showreel> = {
	title: 'ContentBlocks/Showreel',
	component: Showreel,
	parameters: {
		docs: { description: { component: 'Case-style showreel: large rounded media slides with captions, arrow controls and optional video slides that open the shared lightbox.' } },
		jsonSchema: { schema: ShowreelProps },
	},
	argTypes: {
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof Showreel>;

export const Default: Story = {
	args: {
		heading: { tagline: 'In pictures', value: 'The community up close' },
		ratio: '848 / 488',
		slides: [
			{ image: '/media/demo.png', alt: 'First case', title: 'Meetup', description: 'The people behind the usernames.' },
			{ image: '/media/demo.png', alt: 'Second case', title: 'Convention', description: 'Our stand on the con floor.' },
			{ image: '/media/demo.png', alt: 'Video case', title: 'Aftermovie', description: 'Press play for the vibe.', videoSrc: '/media/demo.mp4' },
		],
	},
};
