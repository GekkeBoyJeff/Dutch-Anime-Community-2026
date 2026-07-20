import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import FilterBar from '@/components/components/FilterBar';
import SegmentedControl from '@/components/dashboard/components/SegmentedControl';
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

const ROLE_FILTERS = [
	{ value: '', label: 'Alle rollen', count: 42 },
	{ value: 'user', label: 'Lid', count: 30 },
	{ value: 'stand-staff', label: 'Standteam', count: 6 },
	{ value: 'yakuza', label: 'Yakuza', count: 4 },
	{ value: 'admin', label: 'Beheerder', count: 2 },
];

// Under `[data-theme='admin']` the chips take the dashboard pill skin: count badges, a leading filter
// glyph, a gold-soft active fill and a trailing segmented view-switch.
export const Admin: Story = {
	render: () => {
		const Demo = () => {
			const [value, setValue] = useState('');
			const [search, setSearch] = useState('');
			const [view, setView] = useState('list');
			return (
				<div data-theme="admin" data-colorset="light">
					<FilterBar
						filters={ROLE_FILTERS}
						value={value}
						onValueChange={setValue}
						label="Filter op rol"
						filterIcon="filter"
						searchable
						searchValue={search}
						onSearchValueChange={setSearch}
						searchPlaceholder="Zoek op naam…"
						searchLabel="Zoek gebruiker"
					>
						<SegmentedControl
							size="small"
							aria-label="Weergave"
							value={view}
							onValueChange={setView}
							options={[
								{ value: 'list', label: 'Lijst' },
								{ value: 'agenda', label: 'Agenda' },
							]}
						/>
					</FilterBar>
				</div>
			);
		};
		return <Demo />;
	},
};
