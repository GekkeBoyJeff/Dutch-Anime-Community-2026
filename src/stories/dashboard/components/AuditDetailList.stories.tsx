import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AuditDetailList from '@/components/dashboard/components/AuditDetailList';

const meta: Meta<typeof AuditDetailList> = {
	title: 'Dashboard/Components/AuditDetailList',
	component: AuditDetailList,
	parameters: {
		docs: {
			description: {
				component:
					'The field-level detail of an audit entry: one row per field. A field with a `before` renders an old → new diff; without it (an insert/delete snapshot) it shows the single value.',
			},
		},
	},
	decorators: [(Story) => <div style={{ maxInlineSize: '28rem' }}><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof AuditDetailList>;

export const UpdateDiff: Story = {
	name: 'Update-diff',
	args: {
		entries: [
			{ key: 'title', before: 'Oude titel', after: 'Nieuwe titel' },
			{ key: 'status', before: 'concept', after: 'open' },
		],
	},
};

export const InsertSnapshot: Story = {
	name: 'Insert-snapshot',
	args: {
		entries: [
			{ key: 'name', after: 'Dutch Anime Con 2026' },
			{ key: 'location', after: 'Jaarbeurs Utrecht' },
			{ key: 'starts_on', after: '2026-09-12' },
		],
	},
};

export const Empty: Story = {
	name: 'Leeg',
	args: { entries: [] },
};
