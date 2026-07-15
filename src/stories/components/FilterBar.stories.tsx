import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import FilterBar from '@/components/components/FilterBar';
import { FilterBarProps } from '@/lib/content/schema/components/filterBar';

const FILTERS = [
	{ value: 'all', label: 'All' },
	{ value: 'news', label: 'News' },
	{ value: 'events', label: 'Events' },
	{ value: 'guides', label: 'Guides' },
];

const SORT_OPTIONS = [
	{ value: 'recent', label: 'Most recent' },
	{ value: 'popular', label: 'Most popular' },
	{ value: 'az', label: 'A–Z' },
];

const meta: Meta<typeof FilterBar> = {
	title: 'Components/FilterBar',
	component: FilterBar,
	parameters: {
		docs: {
			description: {
				component:
					'A fully controlled filter toolbar: filter chips (an ARIA tablist of Pills), an optional search input, a native sort select and a reset button. It owns no state — reflect the values from the parent (e.g. to searchParams).',
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

export const Default: Story = {
	args: {
		filters: FILTERS,
		value: 'all',
		searchable: true,
		resettable: true,
	},
};

export const ChipsOnly: Story = {
	...Default,
	args: {
		...Default.args,
		searchable: false,
		resettable: false
	}
};

export const WithSort: Story = {
	...Default,
	args: {
		...Default.args,
		sortOptions: SORT_OPTIONS,
		sortValue: 'recent'
	}
};

// A controlled wrapper so the chips, search and sort actually update in the canvas.
export const Interactive: Story = {
	...Default,
	render: (args) => {
		const Demo = () => {
			const [model, setModel] = useState('all');
			const [search, setSearch] = useState('');
			const [sort, setSort] = useState('recent');

			return (
				<FilterBar
					{...args}
					filters={FILTERS}
					sortOptions={SORT_OPTIONS}
					value={model}
					searchValue={search}
					sortValue={sort}
					searchable
					resettable
					onValueChange={setModel}
					onSearchValueChange={setSearch}
					onSortChange={setSort}
					onReset={() => {
						setModel('all');
						setSearch('');
						setSort('recent');
					}}
				/>
			);
		}

		return <Demo />;
	},
};
