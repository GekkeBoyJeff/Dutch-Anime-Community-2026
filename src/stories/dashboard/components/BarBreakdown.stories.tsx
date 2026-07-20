import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BarBreakdown from '@/components/dashboard/components/BarBreakdown';

const eur = (value: number): string => new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(value);

const meta: Meta<typeof BarBreakdown> = {
	title: 'Dashboard/Components/BarBreakdown',
	component: BarBreakdown,
	parameters: {
		docs: {
			description: {
				component:
					'Horizontal bar breakdown: labeled rows with a proportional track and a formatted value. Domain-free — the consumer injects formatValue; loading shows a tapering skeleton.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxWidth: '24rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof BarBreakdown>;

export const Default: Story = {
	args: {
		title: 'Besteed per categorie',
		emptyLabel: 'Nog niets besteed in deze selectie.',
		formatValue: eur,
		rows: [
			{ label: 'Locatie', value: 1850 },
			{ label: 'Techniek', value: 1240 },
			{ label: 'Catering', value: 620 },
			{ label: 'Promotie', value: 310 },
		],
	},
};

export const SingleRow: Story = {
	name: 'Één rij',
	args: {
		title: 'Besteed per conventie',
		emptyLabel: 'Nog niets besteed in deze selectie.',
		formatValue: eur,
		rows: [{ label: 'Losse declaraties', value: 480 }],
	},
};

export const Empty: Story = {
	name: 'Leeg',
	args: {
		title: 'Besteed per categorie',
		emptyLabel: 'Nog niets besteed in deze selectie.',
		formatValue: eur,
		rows: [],
	},
};

export const Loading: Story = {
	args: {
		title: 'Besteed per categorie',
		emptyLabel: 'Nog niets besteed in deze selectie.',
		formatValue: eur,
		rows: [],
		loading: true,
	},
};

export const LongLabels: Story = {
	name: 'Lange labels',
	args: {
		title: 'Besteed per conventie',
		emptyLabel: 'Nog niets besteed in deze selectie.',
		formatValue: eur,
		rows: [
			{ label: 'Nishikigoi Winterconventie 2026 — Utrecht', value: 2400 },
			{ label: 'Sakura Lentemarkt & Artist Alley', value: 1650 },
			{ label: 'Losse declaraties', value: 300 },
		],
	},
};

export const CustomFormat: Story = {
	name: 'Custom format',
	args: {
		title: 'Verkochte tickets per dag',
		emptyLabel: 'Nog geen verkoop.',
		formatValue: (value) => `${value}×`,
		rows: [
			{ label: 'Zaterdag', value: 320 },
			{ label: 'Zondag', value: 210 },
			{ label: 'Vrijdag', value: 95 },
		],
	},
};
