import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import SegmentedControl, { type SegmentedOption } from '@/components/dashboard/components/SegmentedControl';

const meta: Meta<typeof SegmentedControl> = {
	title: 'Dashboard/Components/SegmentedControl',
	component: SegmentedControl,
	parameters: {
		docs: {
			description: {
				component:
					'A segmented control with a spring-sliding thumb (research-visual §3): a grouped pill for 2–5 mutually-exclusive options that replaces small selects and filter-pill rows. Proper radiogroup semantics — roving tabindex, arrow-key navigation, aria-checked — and a CSS-driven thumb so there is no layout shift. Controlled: the parent owns `value`.',
			},
		},
	},
	argTypes: {
		size: { control: 'inline-radio', options: ['default', 'small'] },
	},
};

export default meta;

type Story = StoryObj<typeof SegmentedControl>;

const PERIODS: SegmentedOption[] = [
	{ value: 'all', label: 'Alle' },
	{ value: 'upcoming', label: 'Aankomend' },
	{ value: 'past', label: 'Verlopen' },
];

// A controlled wrapper so the thumb actually slides in the workshop.
const Interactive = ({ options, ...args }: { options: SegmentedOption[]; size?: 'default' | 'small' }) => {
	const [value, setValue] = useState(options[0]?.value ?? '');
	return <SegmentedControl {...args} options={options} value={value} onValueChange={setValue} aria-label="Periode" />;
};

export const Default: Story = {
	render: (args) => <Interactive options={PERIODS} size={args.size} />,
};

export const WithCounts: Story = {
	render: (args) => (
		<Interactive
			size={args.size}
			options={[
				{ value: 'open', label: 'Open', count: 4 },
				{ value: 'mine', label: 'Van mij', count: 1 },
				{ value: 'done', label: 'Afgehandeld', count: 12 },
			]}
		/>
	),
};

export const WithIcons: Story = {
	render: (args) => (
		<Interactive
			size={args.size}
			options={[
				{ value: 'list', label: 'Lijst', icon: 'list' },
				{ value: 'board', label: 'Bord', icon: 'menu' },
				{ value: 'agenda', label: 'Agenda', icon: 'calendar' },
			]}
		/>
	),
};

export const TwoOptions: Story = {
	render: (args) => (
		<Interactive
			size={args.size}
			options={[
				{ value: 'income', label: 'Inkomsten' },
				{ value: 'spend', label: 'Uitgaven' },
			]}
		/>
	),
};

export const FiveOptions: Story = {
	render: (args) => (
		<Interactive
			size={args.size}
			options={[
				{ value: 'd', label: 'Dag' },
				{ value: 'w', label: 'Week' },
				{ value: 'm', label: 'Maand' },
				{ value: 'q', label: 'Kwartaal' },
				{ value: 'y', label: 'Jaar' },
			]}
		/>
	),
};

export const Small: Story = {
	render: () => <Interactive options={PERIODS} size="small" />,
};

export const WithDisabled: Story = {
	render: () => (
		<Interactive
			options={[
				{ value: 'all', label: 'Alle' },
				{ value: 'upcoming', label: 'Aankomend' },
				{ value: 'past', label: 'Verlopen', disabled: true },
			]}
		/>
	),
};
