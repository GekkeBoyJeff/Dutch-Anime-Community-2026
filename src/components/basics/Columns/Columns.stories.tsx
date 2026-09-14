import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Column from '@/components/basics/Column/Column';
import type { ResponsiveSpan } from '@/components/basics/Column/Column.schema';

import Columns from './Columns';
import { ColumnsProps } from './Columns.schema';

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

type ColumnsStoryArgs = ColumnsProps & { spans: ResponsiveSpan[] };

const meta: Meta<ColumnsStoryArgs> = {
	title: 'Basics/Columns',
	component: Columns,
	parameters: {
		docs: {
			description: {
				component: 'A row of the 12-column grid. Put Column cells inside and give each a span; the row keeps the space between them. Every column layout in a content block starts with one of these.',
			},
		},
		jsonSchema: { schema: ColumnsProps },
	},
	argTypes: {
		gap: { control: 'inline-radio', options: [undefined, 'none', 's', 'm', 'l', 'xl'] },
		spans: { control: 'object', description: 'One span per cell, in order (story data, not a prop)' },
	},
	render: ({ spans, ...args }) => (
		<Columns {...args}>
			{spans.map((span, index) => (
				<Column key={index} span={span}>
					{cell(`${index + 1} / ${spans.length}`)}
				</Column>
			))}
		</Columns>
	),
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Thirds: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Three equal cells from the m breakpoint up; on a phone they stack at full width.',
			},
		},
	},
	args: {
		spans: [
			{
				default: 12,
				m: 4,
			},
			{
				default: 12,
				m: 4,
			},
			{
				default: 12,
				m: 4,
			},
		],
	},
};

export const MainAndSidebar: Story = {
	args: {
		spans: [
			{
				default: 12,
				m: 8,
			},
			{
				default: 12,
				m: 4,
			},
		],
	},
};
