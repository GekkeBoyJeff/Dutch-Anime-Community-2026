import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { demoImage } from '@/components/basics/Media/Media.stories';

import EventTeaser from './EventTeaser';
import { EventTeaserProps } from './EventTeaser.schema';

const meta: Meta<typeof EventTeaser> = {
	title: 'ContentBlocks/EventTeaser',
	component: EventTeaser,
	parameters: {
		docs: {
			description: {
				component:
					'Single-column teaser list: a heading cluster, an optional intro, a dense stack of compact event cards and an optional “view all” link. Presentational — every event arrives via props.',
			},
		},
		jsonSchema: { schema: EventTeaserProps },
	},
};

export default meta;

type Story = StoryObj<typeof EventTeaser>;

export const Default: Story = {
	args: {
		heading: {
			title: 'Upcoming events',
			tagline: 'Save the date',
			intro: 'A few things happening soon.',
		},
		value: 'Tickets go fast — grab yours early.',
		viewAllUrl: '/events',
		viewAllLabel: 'View all events',
		events: [
			{
				id: 'e1',
				title: 'Spring meetup',
				value: 'An evening of talks and snacks.',
				media: demoImage,
				href: '#',
				startDate: '2026-04-12T18:00:00Z',
				endDate: '2026-04-12T21:00:00Z',
				location: 'Amsterdam',
				status: 'Free',
				statusVariant: 'success',
			},
			{
				id: 'e2',
				title: 'Summer screening',
				value: 'Outdoor showing under the stars.',
				media: demoImage,
				href: '#',
				startDate: '2026-06-20T20:30:00Z',
				location: 'Utrecht',
				status: 'Few seats',
				statusVariant: 'warning',
			},
			{
				id: 'e3',
				title: 'Autumn workshop',
				value: 'Hands-on session for all levels.',
				media: demoImage,
				href: '#',
				startDate: '2026-09-05T13:00:00Z',
				endDate: '2026-09-05T17:00:00Z',
				location: 'Online',
			},
		],
	},
};

export const WithoutViewAll: Story = {
	...Default,
	args: {
		...Default.args,
		viewAllUrl: undefined,
	},
};

export const OnDark: Story = {
	...Default,
	args: {
		...Default.args,
		colorset: 'dark',
	},
};
