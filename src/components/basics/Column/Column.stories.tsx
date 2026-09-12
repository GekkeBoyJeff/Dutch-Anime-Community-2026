import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Columns from '@/components/basics/Columns/Columns';
import { cell } from '@/stories/gridCell';

import Column from './Column';
import { ColumnProps } from './Column.schema';


const meta: Meta<typeof Column> = {
	title: 'Basics/Column',
	component: Column,
	parameters: {
		docs: { description: { component: 'A single cell of the 12-column grid. `span*` props set the width per breakpoint (full width by default); `offset*` pushes the cell across empty columns.' } },
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

export const SpanFromMedium: Story = {
	parameters: {
		docs: { description: { story: 'Full width below the m breakpoint, 8 of 12 columns from m up.' } },
	},
	args: {
		spanM: 8,
		children: cell('8 from m'),
	},
};
