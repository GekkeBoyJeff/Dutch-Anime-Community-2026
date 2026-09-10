import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import FilterBar from '@/components/components/FilterBar';
import { FilterBarProps } from '@/lib/site/content/schema/components/filterBar';

const meta: Meta<typeof FilterBar> = {
	title: 'Components/FilterBar',
	component: FilterBar,
	parameters: {
		docs: {
			description: {
				component:
					'The controls above a listing: filter chips, an optional sort select, an optional search field and a reset. It owns no state — every value is passed in and every change is reported back, so the list that reads them stays the single source of truth.',
			},
		},
		jsonSchema: { schema: FilterBarProps },
	},
	argTypes: {
		searchable: { control: 'boolean' },
		resettable: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof FilterBar>;

const filters = [
	{ label: 'Alles', value: 'all', count: 42 },
	{ label: 'Meetups', value: 'meetup', count: 18 },
	{ label: 'Watch parties', value: 'watch-party', count: 15 },
	{ label: 'Conventies', value: 'convention', count: 9 },
];

export const Default: Story = {
	args: {
		filters,
		value: 'all',
	},
};

export const WithSort: Story = {
	...Default,
	args: {
		...Default.args,
		sortOptions: [
			{ label: 'Datum', value: 'date' },
			{ label: 'Naam', value: 'name' },
		],
		sortValue: 'date',
	},
};

export const Searchable: Story = {
	...Default,
	args: {
		...WithSort.args,
		searchable: true,
		searchPlaceholder: 'Zoek een evenement…',
	},
};

export const Resettable: Story = {
	...Default,
	args: {
		...Searchable.args,
		value: 'meetup',
		resettable: true,
	},
};

export const WithIcon: Story = {
	...Default,
	args: {
		...Default.args,
		filterIcon: 'filter',
	},
};
