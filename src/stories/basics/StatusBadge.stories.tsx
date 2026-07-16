import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import StatusBadge from '@/components/basics/StatusBadge';

const meta: Meta<typeof StatusBadge> = {
	title: 'Basics/StatusBadge',
	component: StatusBadge,
	parameters: {
		docs: {
			description: {
				component:
					'The canonical domain-status chip built on Badge. Maps a domain (warning, expense, attendance, request) + status key onto one semantic colour + Dutch label, so every beheer screen renders a status the same way. Read-only — use Pill for interactive filters.',
			},
		},
	},
	argTypes: {
		dot: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof StatusBadge>;

export const Expense: Story = {
	args: { domain: 'expense', status: 'approved' },
};

export const WithDot: Story = {
	args: { domain: 'expense', status: 'submitted', dot: true },
};

export const UnknownStatus: Story = {
	args: { domain: 'request', status: 'zomaar-iets' },
};

export const AllDomains: Story = {
	render: () => (
		<div style={{ display: 'grid', gap: '0.75rem' }}>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
				<StatusBadge domain="warning" status="yellow" />
				<StatusBadge domain="warning" status="red" />
			</div>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
				<StatusBadge domain="expense" status="submitted" />
				<StatusBadge domain="expense" status="approved" />
				<StatusBadge domain="expense" status="rejected" />
				<StatusBadge domain="expense" status="reimbursed" />
			</div>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
				<StatusBadge domain="attendance" status="signed_up" />
				<StatusBadge domain="attendance" status="present" />
				<StatusBadge domain="attendance" status="late" />
				<StatusBadge domain="attendance" status="no_show" />
			</div>
			<div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
				<StatusBadge domain="request" status="requested" />
				<StatusBadge domain="request" status="approved" />
				<StatusBadge domain="request" status="rejected" />
				<StatusBadge domain="request" status="cancelled" />
			</div>
		</div>
	),
};
