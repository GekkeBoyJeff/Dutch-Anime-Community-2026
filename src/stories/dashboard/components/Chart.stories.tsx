import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Chart from '@/components/dashboard/components/Chart';

const meta: Meta = {
	title: 'Dashboard/Components/Chart',
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'One chart family, one recharts wrap: Chart.Line (line or area), Chart.Bar and Chart.Donut. All share the ChartFrame — a fixed-height card (zero CLS) with title, popover-style tooltip, and loading/empty states — and a categorical palette anchored on the DAC gold with warm/cool neutral supports. Intro animation is dropped under prefers-reduced-motion.',
			},
		},
	},
};

export default meta;

type Story = StoryObj;

const MONTHS = [
	{ label: 'feb 26', besteed: 320, inkomsten: 500 },
	{ label: 'mrt 26', besteed: 540, inkomsten: 480 },
	{ label: 'apr 26', besteed: 410, inkomsten: 620 },
	{ label: 'mei 26', besteed: 780, inkomsten: 700 },
	{ label: 'jun 26', besteed: 620, inkomsten: 900 },
	{ label: 'jul 26', besteed: 940, inkomsten: 850 },
];

const CATEGORIES = [
	{ label: 'Merch', besteed: 1240 },
	{ label: 'Reis', besteed: 860 },
	{ label: 'Catering', besteed: 540 },
	{ label: 'Print', besteed: 320 },
	{ label: 'Overig', besteed: 180 },
];

const eur = (value: number) => `€ ${value.toLocaleString('nl-NL')}`;

export const Area: Story = {
	render: () => (
		<div style={{ maxWidth: '40rem' }}>
			<Chart.Line variant="area" title="Uitgaven per maand" data={MONTHS} series={[{ key: 'besteed', name: 'Besteed' }]} formatValue={eur} />
		</div>
	),
};

export const LineMultiSeries: Story = {
	render: () => (
		<div style={{ maxWidth: '40rem' }}>
			<Chart.Line
				title="Inkomsten vs. uitgaven"
				data={MONTHS}
				series={[
					{ key: 'inkomsten', name: 'Inkomsten' },
					{ key: 'besteed', name: 'Besteed', color: '#57534e' },
				]}
				formatValue={eur}
			/>
		</div>
	),
};

export const Bar: Story = {
	render: () => (
		<div style={{ maxWidth: '40rem' }}>
			<Chart.Bar title="Besteed per categorie" data={CATEGORIES} series={[{ key: 'besteed', name: 'Besteed' }]} formatValue={eur} />
		</div>
	),
};

export const Donut: Story = {
	render: () => (
		<div style={{ maxWidth: '32rem' }}>
			<Chart.Donut
				title="Besteed per categorie"
				data={CATEGORIES.map((c) => ({ label: c.label, value: c.besteed }))}
				formatValue={eur}
				centerLabel={eur(CATEGORIES.reduce((s, c) => s + c.besteed, 0))}
				centerCaption="totaal"
			/>
		</div>
	),
};

export const Loading: Story = {
	render: () => (
		<div style={{ maxWidth: '40rem' }}>
			<Chart.Bar title="Besteed per categorie" data={[]} series={[{ key: 'besteed', name: 'Besteed' }]} loading />
		</div>
	),
};

export const EmptyState: Story = {
	render: () => (
		<div style={{ maxWidth: '40rem' }}>
			<Chart.Line variant="area" title="Uitgaven per maand" data={[]} series={[{ key: 'besteed', name: 'Besteed' }]} emptyLabel="Nog niets besteed in deze selectie." />
		</div>
	),
};
