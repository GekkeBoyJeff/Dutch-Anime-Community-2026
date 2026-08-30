import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Icon from '@/components/basics/Icon';
import StatusBadge from '@/components/basics/StatusBadge';
import Entry from '@/components/components/Entry';
import { EntryProps } from '@/lib/site/content/schema/components/entry';

const meta: Meta<typeof Entry> = {
	title: 'Components/Entry',
	component: Entry,
	parameters: {
		docs: {
			description: {
				component:
					'One row of data: a leading marker, a main label over an optional sub-line, and a trailing slot. Compose inside Entry.List, which owns the dividers.',
			},
		},
		jsonSchema: { schema: EntryProps },
	},
	argTypes: {
		tone: { control: 'inline-radio', options: ['neutral', 'positive', 'warning', 'negative'] },
		loading: { control: 'boolean' },
	},
	render: (args) => <Entry.List items={[args]} />,
};

export default meta;

type Story = StoryObj<typeof Entry>;

export const Default: Story = {
	args: { main: 'Katana replica', sub: 'Jeffrey', trailing: '€ 45,00' },
};

export const WithMarker: Story = {
	args: {
		main: 'Declaratie treinkaartje',
		sub: '12 augustus',
		marker: <Icon name="file" />,
		tone: 'warning',
		trailing: <StatusBadge domain="expense" status="submitted" />,
	},
};

export const Loading: Story = {
	args: { main: 'Katana replica', sub: 'Jeffrey', loading: true },
};

export const List: Story = {
	render: () => (
		<Entry.List
			items={[
				{ main: 'Katana replica', sub: 'Jeffrey', tone: 'positive', marker: <Icon name="check" />, trailing: '3×' },
				{ main: 'Banner groot', sub: 'Sanne', trailing: '1×' },
				{ main: 'Kassalade', sub: 'Niet beschikbaar', tone: 'negative', marker: <Icon name="close" />, trailing: '0×' },
			]}
		/>
	),
};
