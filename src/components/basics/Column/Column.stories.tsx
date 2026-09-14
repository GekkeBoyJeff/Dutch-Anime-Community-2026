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

type ColumnStoryArgs = ColumnProps & { label: string };

const meta: Meta<ColumnStoryArgs> = {
	title: 'Basics/Column',
	component: Column,
	parameters: {
		docs: {
			description: {
				component: 'One cell of the 12-column grid; always place it inside a Columns. `span` says how many columns it takes, as one number (`span={6}`) or per breakpoint (`span={{ default: 12, m: 6, l: 4 }}`: full width on a phone, half from the m breakpoint, a third from l). `offset` skips columns before it in the same way.',
			},
		},
		jsonSchema: { schema: ColumnProps },
	},
	argTypes: {
		span: { control: 'object' },
		offset: { control: 'object' },
		label: { control: 'text', description: 'Text shown inside the cell' },
	},
	decorators: [
		(Story) => (
			<Columns>
				<Story />
			</Columns>
		),
	],
	render: ({ label, ...args }) => (
		<Column {...args}>
			{cell(label)}
		</Column>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
	args: {
		span: 6,
		offset: 3,
		label: 'span 6, offset 3',
	},
};

export const PerBreakpoint: Story = {
	parameters: {
		docs: {
			description: {
				story: 'One cell whose width changes with the screen: full width on a phone, half from the m breakpoint, a third from l. The offset grows with it so the cell stays centred.',
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
		label: '12 · 6 from m · 4 from l',
	},
};
