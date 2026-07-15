import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Column from '@/components/basics/Column';
import Columns from '@/components/basics/Columns';
import { ColumnsProps } from '@/lib/content/schema/basics/columns';
import { cell } from '@/stories/basics/gridCell';

const meta: Meta<typeof Columns> = {
	title: 'Basics/Columns',
	component: Columns,
	parameters: {
		docs: { description: { component: 'The row half of the grid pair: a 12-column CSS grid that Column children span into. Combine with Column for responsive layouts.' } },
		jsonSchema: { schema: ColumnsProps },
	},
	argTypes: {
		align: { control: 'inline-radio', options: [undefined, 'start', 'center', 'end', 'stretch', 'baseline'] },
		gap: { control: 'inline-radio', options: [undefined, 'none', 's', 'm', 'l', 'xl'] },
	},
};

export default meta;

type Story = StoryObj<typeof Columns>;

// Three equal thirds from the m breakpoint up; full width and stacked below it.
export const Thirds: Story = {
	render: (args) => (
		<Columns {...args}>
			<Column spanM={4}>{cell('1 / 3')}</Column>
			<Column spanM={4}>{cell('2 / 3')}</Column>
			<Column spanM={4}>{cell('3 / 3')}</Column>
		</Columns>
	),
};

// An asymmetric main + sidebar split.
export const MainAndSidebar: Story = {
	render: (args) => (
		<Columns {...args}>
			<Column spanM={8}>{cell('main (8)')}</Column>
			<Column spanM={4}>{cell('aside (4)')}</Column>
		</Columns>
	),
};
