import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StatTile from '@/components/dashboard/components/StatTile';

const meta: Meta<typeof StatTile> = {
	title: 'Dashboard/Components/StatTile',
	component: StatTile,
	parameters: {
		docs: {
			description: {
				component:
					'Dashboard summary tile: caption, a large figure and an optional sub-line on a bordered surface. Its box is a fixed height so a loading→loaded swap never shifts the row. Lay several out inside a `.stat-tile-row` (auto-fit grid).',
			},
		},
	},
	argTypes: {
		tone: { control: 'inline-radio', options: ['default', 'positive', 'negative'] },
		loading: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof StatTile>;

export const Default: Story = {
	args: {
		label: 'Inkomsten',
		value: '€ 4.250,00',
	},
};

export const WithNote: Story = {
	args: {
		label: 'Uitgaven (besteed)',
		value: '€ 3.180,00',
		note: 'waarvan € 420,00 in behandeling',
	},
};

export const Positive: Story = {
	args: {
		label: 'Saldo',
		value: '€ 1.070,00',
		note: 'inkomsten − besteed',
		tone: 'positive',
	},
};

export const Negative: Story = {
	args: {
		label: 'Saldo',
		value: '−€ 340,00',
		note: 'inkomsten − besteed',
		tone: 'negative',
	},
};

export const Loading: Story = {
	args: {
		label: 'Inkomsten',
		value: '€ 4.250,00',
		note: 'waarvan € 420,00 in behandeling',
		loading: true,
	},
};

export const Row: Story = {
	render: () => (
		<div className="stat-tile-row">
			<StatTile label="Aankomend" value="3" />
			<StatTile label="Eerstvolgende datum" value="12 sep 2026" />
			<StatTile label="Events dit jaar" value="7" />
		</div>
	),
};
