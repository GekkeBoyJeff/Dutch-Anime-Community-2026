import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import LogsViewer from '@/components/dashboard/logs/LogsViewer';

const meta: Meta<typeof LogsViewer> = {
	title: 'Dashboard/Logs/LogsViewer',
	component: LogsViewer,
	globals: { role: 'admin' },
	parameters: {
		docs: {
			description: {
				component:
					'The read-only log window: **Activiteit** (a readable domain log) and **Audit** (row history per table, with a field-level diff in a drawer). Requires `logs.view`, which only the **Beheerder** role holds.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof LogsViewer>;

export const Default: Story = {};
