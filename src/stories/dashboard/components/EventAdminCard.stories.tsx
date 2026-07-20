import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventAdminCard from '@/components/dashboard/components/EventAdminCard';

const noop = () => {};

const meta: Meta<typeof EventAdminCard> = {
	title: 'Dashboard/Components/EventAdminCard',
	component: EventAdminCard,
	parameters: {
		docs: {
			description: {
				component:
					'One convention as an admin card: a date chip, name, location + date range, a status badge and the row actions. Dates arrive as ISO strings; a missing action callback hides its button. `loading` renders the pre-sized skeleton twin.',
			},
		},
	},
	argTypes: {
		status: { control: 'inline-radio', options: ['upcoming', 'past'] },
		compact: { control: 'boolean' },
		archived: { control: 'boolean' },
		loading: { control: 'boolean' },
	},
	decorators: [
		(Story) => (
			<div style={{ maxInlineSize: '22rem' }}>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof EventAdminCard>;

export const Default: Story = {
	args: {
		name: 'Dutch Anime Convention 2026',
		location: 'Jaarbeurs Utrecht',
		startsOn: '2026-09-12',
		endsOn: '2026-09-13',
		status: 'upcoming',
		onManage: noop,
		onEdit: noop,
		onArchive: noop,
		onDelete: noop,
	},
};

export const PastCompact: Story = {
	name: 'Past (compact)',
	args: {
		name: 'Zomeranime Meetup',
		location: 'Amsterdam',
		startsOn: '2025-07-05',
		status: 'past',
		compact: true,
		onManage: noop,
		onEdit: noop,
		onArchive: noop,
	},
};

export const Archived: Story = {
	args: {
		name: 'Winterfeest 2024',
		location: 'Rotterdam',
		startsOn: '2024-12-14',
		status: 'past',
		archived: true,
		onManage: noop,
		onRestore: noop,
	},
};

export const Loading: Story = {
	args: {
		name: '',
		startsOn: null,
		status: 'upcoming',
		loading: true,
		onManage: noop,
	},
};

export const WithoutLocation: Story = {
	name: 'Zonder locatie',
	args: {
		name: 'Nog te plannen event',
		location: null,
		startsOn: null,
		status: 'upcoming',
		onManage: noop,
		onEdit: noop,
		onArchive: noop,
	},
};

export const DeleteHidden: Story = {
	name: 'Delete verborgen',
	args: {
		name: 'Anime Filmavond',
		location: 'Eindhoven',
		startsOn: '2026-10-03',
		status: 'upcoming',
		onManage: noop,
		onEdit: noop,
		onArchive: noop,
	},
};
