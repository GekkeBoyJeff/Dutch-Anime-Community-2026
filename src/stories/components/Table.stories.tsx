import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Table from '@/components/components/Table';
import { TableProps } from '@/lib/content/schema/components/table';

const meta: Meta<typeof Table> = {
	title: 'Components/Table',
	component: Table,
	parameters: {
		docs: { description: { component: 'Styled semantic table with a horizontal scroll container and a mobile stacked layout (each row becomes label/value pairs). The responsive-table primitive PricingComparison and ComparisonTable reuse; stays a Server Component.' } },
		jsonSchema: { schema: TableProps },
	},
	argTypes: {
		striped: { control: 'boolean' },
		bordered: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Table>;

export const Default: Story = {
	args: {
		caption: 'Event line-up for the spring convention',
		columns: [
			{ header: 'Activity' },
			{ header: 'Room' },
			{ header: 'Time', align: 'end' },
		],
		rows: [
			['Opening ceremony', 'Main Hall', '10:00'],
			['Cosplay contest', 'Stage B', '13:30'],
			['Artist alley meetup', 'Foyer', '15:00'],
			['Closing panel', 'Main Hall', '17:45'],
		],
	},
};

export const Striped: Story = {
	...Default,
	args: {
		...Default.args,
		striped: true
	}
};

export const Bordered: Story = {
	...Default,
	args: {
		...Default.args,
		bordered: true
	}
};

export const StripedAndBordered: Story = {
	...Default,
	args: {
		...Default.args,
		striped: true,
		bordered: true
	}
};
