import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StatusBadge from '@/components/basics/StatusBadge';
import { StatusBadgeProps, StatusDomain } from '@/lib/site/content/schema/basics/statusBadge';

const meta: Meta<typeof StatusBadge> = {
	title: 'Basics/StatusBadge',
	component: StatusBadge,
	parameters: {
		docs: {
			description: {
				component:
					'The canonical domain-status chip built on Badge. Maps a domain + status key onto one semantic colour + Dutch label, so every beheer screen renders a status the same way. Read-only — use Pill for interactive filters.',
			},
		},
		jsonSchema: { schema: StatusBadgeProps },
	},
	argTypes: {
		domain: { control: 'inline-radio', options: StatusDomain.options },
		dot: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Warning: Story = {
	args: { domain: 'warning', status: 'yellow' },
};

export const Expense: Story = {
	args: { domain: 'expense', status: 'approved' },
};

export const Attendance: Story = {
	args: { domain: 'attendance', status: 'late' },
};

export const Request: Story = {
	args: { domain: 'request', status: 'requested' },
};

export const Survey: Story = {
	args: { domain: 'survey', status: 'open' },
};

export const WithDot: Story = {
	args: { domain: 'expense', status: 'submitted', dot: true },
};

export const UnknownStatus: Story = {
	args: { domain: 'request', status: 'unknown-status' },
};
