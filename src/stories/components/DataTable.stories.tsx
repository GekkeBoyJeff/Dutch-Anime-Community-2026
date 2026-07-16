import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Badge from '@/components/basics/Badge';
import DataTable, { type DataTableColumn } from '@/components/components/DataTable';

interface Member {
	id: string;
	name: string;
	role: string;
	items: number;
}

const MEMBERS: Member[] = [
	{ id: '1', name: 'Sanne de Vries', role: 'yakuza', items: 12 },
	{ id: '2', name: 'Bram Jansen', role: 'stand-staff', items: 3 },
	{ id: '3', name: 'Yuki Tanaka', role: 'admin', items: 7 },
	{ id: '4', name: 'Noor El Amrani', role: 'stand-staff', items: 5 },
	{ id: '5', name: 'Tim Bakker', role: 'user', items: 0 },
	{ id: '6', name: 'Lotte Peters', role: 'yakuza', items: 9 },
	{ id: '7', name: 'Kevin Smit', role: 'stand-staff', items: 2 },
	{ id: '8', name: 'Aya Nakamura', role: 'stand-staff', items: 6 },
	{ id: '9', name: 'Daan Visser', role: 'user', items: 1 },
	{ id: '10', name: 'Emma Willems', role: 'yakuza', items: 14 },
	{ id: '11', name: 'Ravi Sharma', role: 'stand-staff', items: 4 },
	{ id: '12', name: 'Fleur Dijkstra', role: 'admin', items: 8 },
	{ id: '13', name: 'Sven Mulder', role: 'user', items: 0 },
	{ id: '14', name: 'Mila Hendriks', role: 'stand-staff', items: 3 },
];

const columns: DataTableColumn<Member>[] = [
	{ key: 'name', header: 'Naam', sortable: true, sortValue: (row) => row.name, cell: (row) => row.name },
	{ key: 'role', header: 'Rol', sortable: true, sortValue: (row) => row.role, cell: (row) => <Badge variant="neutral">{row.role}</Badge> },
	{ key: 'items', header: 'Items', align: 'center', sortable: true, sortValue: (row) => row.items, cell: (row) => String(row.items) },
];

const meta: Meta<typeof DataTable> = {
	title: 'Components/DataTable',
	component: DataTable,
	parameters: {
		docs: {
			description: {
				component:
					'Client-side sortable + paginated wrapper around Table. Sorting is driven by a compact control (not clickable headers, which are unreachable on mobile where Table hides its thead) and slices client-side via Pagination. Renders EmptyState when there is no data.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof DataTable>;

export const Default: Story = {
	render: () => (
		<DataTable<Member>
			columns={columns}
			data={MEMBERS}
			pageSize={8}
			initialSort={{ key: 'name', direction: 'asc' }}
			empty={{ title: 'Geen leden', icon: 'search' }}
		/>
	),
};

export const SinglePage: Story = {
	render: () => <DataTable<Member> columns={columns} data={MEMBERS.slice(0, 4)} pageSize={8} />,
};

export const Empty: Story = {
	render: () => (
		<DataTable<Member>
			columns={columns}
			data={[]}
			empty={{ title: 'Geen leden gevonden', description: 'Pas je zoekopdracht of filters aan.', icon: 'search' }}
		/>
	),
};
