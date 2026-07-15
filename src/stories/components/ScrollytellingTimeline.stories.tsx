import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ScrollytellingTimeline from '@/components/components/ScrollytellingTimeline';
import { ScrollytellingTimelineProps } from '@/lib/content/schema/components/scrollytellingTimeline';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof ScrollytellingTimeline> = {
	title: 'Components/ScrollytellingTimeline',
	component: ScrollytellingTimeline,
	parameters: {
		docs: {
			description: {
				component:
					'A scroll-driven story: a sticky media frame cross-fades between images as the milestone cards scroll past beside it. An IntersectionObserver marks the card nearest the viewport centre as active (works in every browser); under reduced motion every frame and card is shown stacked. A small client island. Scroll the preview to drive it.',
			},
		},
		jsonSchema: { schema: ScrollytellingTimelineProps },
	},
	argTypes: {
		headingLevel: {
			control: 'inline-radio',
			options: [2, 3, 4, 5],
		},
	},
};

export default meta;

type Story = StoryObj<typeof ScrollytellingTimeline>;

export const Default: Story = {
	args: {
		ariaLabel: 'Our story',
		headingLevel: 3,
		milestones: [
			{
				year: '2019',
				tagline: 'The start',
				title: 'A Discord and a dream',
				description: 'A handful of fans started watching series together every week.',
				media: { ...demoImage, ratio: '4 / 3' },
			},
			{
				year: '2021',
				title: 'Our first live event',
				description: 'Two hundred members met up for a season premiere screening.',
				media: { ...demoImage, ratio: '4 / 3' },
			},
			{
				year: '2025',
				tagline: 'Today',
				title: 'A platform of our own',
				description: 'A rebuilt site with watch parties, reviews and event listings.',
				media: { ...demoImage, ratio: '4 / 3' },
			},
		],
	},
};
