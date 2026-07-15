import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventCardGrid from '@/components/contentBlocks/EventCardGrid';
import { EventCardGridProps } from '@/lib/content/schema/blocks/eventCardGrid';
import { demoImage } from '@/stories/basics/Media.stories';

const events = [
	{ id: 'e1', title: 'Spring meetup', summary: 'Talks, demos and an open mic.', media: demoImage, href: '#', startDate: '2026-04-12T18:00:00Z', endDate: '2026-04-12T21:00:00Z', location: 'Amsterdam', status: 'Free', category: 'meetup' },
	{ id: 'e2', title: 'Annual convention', summary: 'Two days of workshops and panels.', media: demoImage, href: '#', startDate: '2026-06-20T09:00:00Z', endDate: '2026-06-21T17:00:00Z', location: 'Utrecht', status: 'Sold out', category: 'convention' },
	{ id: 'e3', title: 'Online workshop', summary: 'Hands-on session, bring a laptop.', media: demoImage, href: '#', startDate: '2026-05-03T15:00:00Z', location: 'Online', category: 'workshop' },
	{ id: 'e4', title: 'Community drinks', summary: 'Casual hangout, no agenda.', media: demoImage, href: '#', startDate: '2026-03-28T19:30:00Z', location: 'Rotterdam', category: 'meetup' },
];

const meta: Meta<typeof EventCardGrid> = {
	title: 'ContentBlocks/EventCardGrid',
	component: EventCardGrid,
	parameters: {
		docs: { description: { component: 'Event-listing card grid: maps events onto the shared filterable ItemCardGrid with the event card variant. Filter and sort options are props (no hardcoded enums); date sorting runs on each event’s ISO startDate.' } },
		jsonSchema: { schema: EventCardGridProps },
	},
	argTypes: {
		columns: { control: 'inline-radio', options: [1, 2, 3, 4] },
		cardSize: { control: 'inline-radio', options: ['compact', 'standard'] },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof EventCardGrid>;

export const Default: Story = {
	args: {
		heading: { value: 'Upcoming events', tagline: 'Agenda', intro: 'Filter, search and sort what’s coming up.' },
		events,
		filterable: true,
		filterOptions: [
			{ label: 'Meetups', value: 'meetup', count: 2 },
			{ label: 'Conventions', value: 'convention', count: 1 },
			{ label: 'Workshops', value: 'workshop', count: 1 },
		],
		searchable: true,
		sortOptions: [
			{ label: 'Soonest', value: 'oldest' },
			{ label: 'Latest', value: 'recent' },
			{ label: 'Title', value: 'title' },
		],
		columns: 3,
		cardSize: 'standard',
	},
};

export const Paginated: Story = {
	...Default,
	args: {
		...Default.args,
		pageSize: 2,
	},
};

export const Plain: Story = {
	...Default,
	args: {
		...Default.args,
		filterable: false,
		searchable: false,
		sortOptions: [],
	},
};
