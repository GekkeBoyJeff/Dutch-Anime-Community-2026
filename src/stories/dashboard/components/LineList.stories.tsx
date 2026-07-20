import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Button from '@/components/basics/Button';
import LineList from '@/components/dashboard/components/LineList';

const meta: Meta<typeof LineList> = {
	title: 'Dashboard/Components/LineList',
	component: LineList,
	parameters: {
		docs: {
			description: {
				component:
					'A compact list of records: each row shows a main label over an optional note, with an optional trailing meta/actions slot. Renders `emptyLabel` when there are no items. The successor to the repo-wide `con-list/con-line/con-note` pattern.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div style={{ maxInlineSize: '32rem' }}>
				<Story />
			</div>
		),
	],
};

export default meta;

type Story = StoryObj<typeof LineList>;

export const Default: Story = {
	args: {
		items: [
			{ main: 'JeffreyDeRuiter', note: 'alias sinds 12 mei 2026' },
			{ main: 'GekkeBoyJeff', note: 'alias sinds 3 jan 2026' },
			{ main: 'Jeff', note: 'alias sinds 8 nov 2025' },
		],
	},
};

export const Empty: Story = {
	name: 'Leeg',
	args: {
		items: [],
		emptyLabel: 'Nog geen aliassen vastgelegd.',
	},
};

export const SingleItem: Story = {
	name: 'Één item',
	args: {
		items: [{ main: 'Dutch Anime Con 2026', note: 'aanwezig' }],
	},
};

export const WithMeta: Story = {
	name: 'Met meta',
	args: {
		items: [
			{ main: 'Ochtendshift', note: '09:00 – 13:00', meta: <Button variant="ghost">Ruilen</Button> },
			{ main: 'Middagshift', note: '13:00 – 17:00', meta: <Button variant="ghost">Ruilen</Button> },
		],
	},
};
