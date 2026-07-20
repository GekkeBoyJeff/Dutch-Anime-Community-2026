import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DataTableSkeleton, { rememberRowCount } from '@/components/dashboard/components/DataTableSkeleton';

const meta: Meta<typeof DataTableSkeleton> = {
	title: 'Dashboard/Components/DataTableSkeleton',
	component: DataTableSkeleton,
	parameters: {
		docs: {
			description: {
				component:
					'Table-shaped loading placeholder used across ~10 dashboard routes. The real (static) headers render immediately and each body cell is a Skeleton whose width mirrors its column alignment. It sits behind the same `.data-table` frame as DataTable, so the box matches the loaded table and nothing shifts on arrival. Row count is explicit (`rows`) or recalled from `storageKey` (last successful count, capped at one page), falling back to `fallbackRows`.',
			},
		},
	},
	argTypes: {
		rows: { control: 'number' },
		fallbackRows: { control: 'number' },
	},
};

export default meta;

type Story = StoryObj<typeof DataTableSkeleton>;

export const Default: Story = {
	args: {
		columns: [{ header: 'Naam' }, { header: 'Rol' }, { header: 'Status' }],
	},
};

export const CustomColumnsAndAlignment: Story = {
	name: 'Custom columns + alignment',
	args: {
		columns: [
			{ header: 'Omschrijving', align: 'start' },
			{ header: 'Categorie', align: 'center' },
			{ header: 'Bedrag', align: 'end' },
			{ header: 'Datum', align: 'end' },
		],
		rows: 4,
	},
};

export const StorageKeyRemembered: Story = {
	name: 'storageKey-remembered rows',
	loaders: [
		async () => {
			// Seed a prior "successful" count so the skeleton reserves that height on this visit.
			rememberRowCount('storybook-demo', 12);
			return {};
		},
	],
	args: {
		columns: [{ header: 'Persoon' }, { header: 'Aanwezigheid' }, { header: '' }],
		storageKey: 'storybook-demo',
		fallbackRows: 6,
	},
};
