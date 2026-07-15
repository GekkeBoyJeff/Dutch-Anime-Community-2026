import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Column from '@/components/basics/Column';
import Columns from '@/components/basics/Columns';
import { ColumnProps } from '@/lib/content/schema/basics/column';
import { cell } from '@/stories/basics/gridCell';

const meta: Meta<typeof Column> = {
	title: 'Basics/Column',
	component: Column,
	parameters: {
		docs: { description: { component: 'A single cell of the 12-column grid. `span*` props set the width per breakpoint (full width by default); `offset*` pushes the cell across empty columns.' } },
		jsonSchema: { schema: ColumnProps },
	},
};

export default meta;

type Story = StoryObj<typeof Column>;

// A half-width cell that is offset by three columns.
export const SpanAndOffset: Story = {
	render: () => (
		<Columns>
			<Column span={6} offset={3}>
				{cell('span 6, offset 3')}
			</Column>
		</Columns>
	),
};

// Spans change at the m breakpoint: stacked on mobile, 8 / 4 on wider screens.
export const SplitFromMedium: Story = {
	render: () => (
		<Columns>
			<Column spanM={8}>{cell('8 from m')}</Column>
			<Column spanM={4}>{cell('4 from m')}</Column>
		</Columns>
	),
};
