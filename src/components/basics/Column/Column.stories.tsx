import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Columns from '@/components/basics/Columns/Columns';

import Column from './Column';
import { ColumnProps } from './Column.schema';

// A tinted, labelled box so the spans and offsets are visible in the examples below.
const cell = (label: string) => (
	<div
		style={{
			background: 'color-mix(in srgb, currentColor 12%, transparent)',
			padding: '1rem',
			borderRadius: '8px',
			textAlign: 'center',
		}}
	>
		{label}
	</div>
);

const meta: Meta<typeof Column> = {
	title: 'Basics/Column',
	component: Column,
	parameters: {
		docs: {
			description: {
				component: 'A single cell of the 12-column grid, always inside a Columns. `span` sets the width as one value (`span={6}`) or per breakpoint (`span={{ default: 12, m: 6, l: 4 }}`, each value holding from that width up); `offset` pushes the cell across empty columns the same way.',
			},
		},
		jsonSchema: { schema: ColumnProps },
	},
	decorators: [
		(Story) => (
			<Columns>
				<Story />
			</Columns>
		),
	],
};

export default meta;

type Story = StoryObj<typeof Column>;

export const Default: Story = {
	args: {
		span: 6,
		offset: 3,
		children: cell('span 6, offset 3'),
	},
};

export const PerBreakpoint: Story = {
	parameters: {
		docs: {
			description: {
				story: 'One cell whose span and offset change per breakpoint: full width below m, half from m, a third from l, kept centred by the offset. Each value holds from that width up.',
			},
		},
	},
	args: {
		span: {
			default: 12,
			m: 6,
			l: 4,
		},
		offset: {
			m: 3,
			l: 4,
		},
		children: cell('12 · 6 from m · 4 from l'),
	},
};
