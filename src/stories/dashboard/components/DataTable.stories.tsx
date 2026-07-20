import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useMemo, useState } from 'react';

import Badge from '@/components/basics/Badge';
import DataTable, { type DataTableColumn } from '@/components/dashboard/components/DataTable';

interface Member {
	id: string;
	name: string;
	role: string;
	shifts: number;
	joined: string;
}

const ROLES = ['Lid', 'Standteam', 'Yakuza', 'Auteur', 'Beheerder'];
const NAMES = ['Aiko', 'Bram', 'Cato', 'Daan', 'Evi', 'Fenna', 'Gijs', 'Hana', 'Iris', 'Joris', 'Kaya', 'Luuk', 'Mila', 'Noah', 'Otis', 'Puck', 'Quinn', 'Roos', 'Sanne', 'Timo', 'Uma', 'Vera', 'Wout', 'Yuki', 'Zoë'];

const DATA: Member[] = NAMES.map((name, index) => ({
	id: String(index + 1),
	name,
	role: ROLES[index % ROLES.length] ?? 'Lid',
	shifts: (index * 7) % 19,
	joined: `202${(index % 4) + 2}-0${(index % 9) + 1}-1${index % 9}`,
}));

const meta: Meta<typeof DataTable<Member>> = {
	title: 'Dashboard/Components/DataTable',
	component: DataTable,
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'The dashboard data table (H2b): a TanStack Table wrap that keeps the v1 column-def API (key/header/align/sortable/sortValue/cell) so consumers only swap the import. New over v1: click-sortable sticky headers with a direction indicator, a nice client-side pager, optional widths, hover/selected row states on the admin tokens, and a compact sort select that keeps sorting reachable once the header collapses into label/value cards on mobile.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof DataTable<Member>>;

const columns: DataTableColumn<Member>[] = [
	{ key: 'name', header: 'Naam', sortable: true, sortValue: (r) => r.name, cell: (r) => r.name },
	{ key: 'role', header: 'Rol', sortable: true, sortValue: (r) => r.role, cell: (r) => <Badge variant="info">{r.role}</Badge> },
	{ key: 'shifts', header: 'Shifts', align: 'end', sortable: true, sortValue: (r) => r.shifts, cell: (r) => r.shifts },
	{ key: 'joined', header: 'Lid sinds', align: 'center', sortable: true, sortValue: (r) => r.joined, cell: (r) => r.joined },
];

export const Default: Story = {
	render: () => <DataTable columns={columns} data={DATA} pageSize={8} initialSort={{ key: 'name', direction: 'asc' }} />,
};

export const SortedByNumber: Story = {
	render: () => <DataTable columns={columns} data={DATA} pageSize={8} initialSort={{ key: 'shifts', direction: 'desc' }} />,
};

export const SelectableRows: Story = {
	render: () => {
		const Demo = () => {
			const [activeId, setActiveId] = useState('3');
			const cols = useMemo(() => columns, []);
			return <DataTable columns={cols} data={DATA} pageSize={8} isRowActive={(r) => r.id === activeId} onRowActivate={(r) => setActiveId(r.id)} />;
		};
		return <Demo />;
	},
};

export const StickyScroll: Story = {
	render: () => <DataTable columns={columns} data={DATA} pageSize={25} maxBodyHeight="18rem" initialSort={{ key: 'shifts', direction: 'desc' }} />,
};

export const Empty: Story = {
	render: () => <DataTable columns={columns} data={[]} empty={{ title: 'Geen leden', description: 'Er zijn nog geen teamleden om te tonen.' }} />,
};
