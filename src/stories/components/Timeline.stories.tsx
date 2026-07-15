import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Timeline from '@/components/components/Timeline';
import { TimelineProps } from '@/lib/content/schema/components/timeline';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof Timeline> = {
	title: 'Components/Timeline',
	component: Timeline,
	parameters: {
		docs: {
			description: {
				component:
					'A vertical milestone timeline rendered as a semantic ordered list: a rail with a dot per milestone, a year block and a card. Cards fade up on scroll via CSS animation-timeline: view() (degrades to visible), so it stays a Server Component with no observer.',
			},
		},
		jsonSchema: { schema: TimelineProps },
	},
	argTypes: {
		align: {
			control: 'inline-radio',
			options: ['alternating', 'left'],
		},
		headingLevel: {
			control: 'inline-radio',
			options: [2, 3, 4, 5],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
	args: {
		align: 'alternating',
		headingLevel: 3,
		items: [
			{
				year: '2019',
				tagline: 'The start',
				title: 'Community founded',
				date: 'March 2019',
				text: 'A handful of fans started a Discord to watch series together.',
			},
			{
				year: '2021',
				title: 'First live event',
				date: 'October 2021',
				text: 'Two hundred members met up for a season premiere screening.',
			},
			{
				year: '2023',
				title: 'Crossed 10,000 members',
				text: 'The community grew into one of the largest in the region.',
			},
			{
				year: '2025',
				tagline: 'Today',
				title: 'New platform launch',
				text: 'A rebuilt site with watch parties, reviews and event listings.',
			},
		],
	},
};

export const LeftAligned: Story = {
	...Default,
	args: {
		...Default.args,
		align: 'left'
	}
};

export const WithMedia: Story = {
	...Default,
	args: {
		...Default.args,
		items: [
			{
				year: '2021',
				title: 'First live event',
				text: 'Two hundred members met up for a season premiere screening.',
				media: { ...demoImage, ratio: '16 / 9' },
			},
			{
				year: '2025',
				title: 'New platform launch',
				text: 'A rebuilt site with watch parties, reviews and event listings.',
				actions: [{ label: 'Read the story', url: '#', variant: 'secondary' }],
			},
		],
	},
};
