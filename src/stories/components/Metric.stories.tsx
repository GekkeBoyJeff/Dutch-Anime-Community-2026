import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Metric from '@/components/components/Metric';

const meta: Meta<typeof Metric> = {
	title: 'Components/Metric',
	component: Metric,
	parameters: {
		docs: {
			description: {
				component: 'A number that matters: caption, a large tabular figure with an optional delta chip, and an optional hand-rolled sparkline.',
			},
		},
	},
	argTypes: {
		tone: { control: 'inline-radio', options: ['neutral', 'positive', 'negative'] },
		loading: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Metric>;

export const Default: Story = {
	args: { label: 'Openstaande declaraties', value: '7' },
};

export const WithDelta: Story = {
	args: { label: 'Inkomsten', value: '€ 4.250', delta: { label: '12%', direction: 'up' } },
};

export const WithTrend: Story = {
	args: {
		label: 'Aanmeldingen per week',
		value: '128',
		delta: { label: '8%', direction: 'up' },
		trend: [42, 51, 47, 63, 58, 79, 94, 128],
	},
};

export const FlatTrend: Story = {
	args: { label: 'Actieve leden', value: '310', trend: [310, 310, 310, 310] },
};

export const Negative: Story = {
	args: { label: 'Saldo', value: '−€ 340', tone: 'negative', delta: { label: '4%', direction: 'down' } },
};

export const Loading: Story = {
	args: { label: 'Inkomsten', value: '€ 4.250', loading: true },
};

export const Row: Story = {
	render: () => (
		<div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(3, 1fr)' }}>
			<Metric label="Aankomend" value="3" />
			<Metric label="Onbezette shifts" value="12" tone="negative" delta={{ label: '3', direction: 'up' }} />
			<Metric label="Ingepakt" value="86" unit="%" trend={[20, 35, 48, 61, 74, 86]} />
		</div>
	),
};
