import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AccessMatrixTable, { type AccessRow } from '@/components/dashboard/components/AccessMatrixTable';
import type { Permission } from '@/lib/auth/permissions';

const rows: AccessRow[] = [
	{ id: 'self-id', username: 'Jeffrey', role: 'admin', grants: new Set<Permission>() },
	{ id: 'u2', username: 'Mila', role: 'author', grants: new Set<Permission>() },
	{ id: 'u3', username: 'Tom', role: 'user', grants: new Set<Permission>(['records.delete']) },
];

const roleGrants = new Map<string, Set<Permission>>([
	['admin', new Set<Permission>(['records.delete', 'logs.view'])],
	['author', new Set<Permission>()],
	['user', new Set<Permission>()],
]);

const noop = () => {};

const meta: Meta<typeof AccessMatrixTable> = {
	title: 'Dashboard/Components/AccessMatrixTable',
	component: AccessMatrixTable,
	parameters: {
		docs: {
			description: {
				component:
					'The access-control users table: username, an inline role select, an exceptions badge and a "Beheer" action. Editing one\'s own row is disabled (matching RLS). A grant counts as an exception only when the role does not already cover it.',
			},
		},
	},
	args: {
		selfId: 'self-id',
		roleGrants,
		empty: { title: 'Geen gebruikers gevonden', description: 'Er zijn nog geen gebruikers.' },
		onSetRole: noop,
		onOpenUser: noop,
	},
};

export default meta;

type Story = StoryObj<typeof AccessMatrixTable>;

export const Default: Story = {
	args: { rows, loading: false },
};

export const Loading: Story = {
	args: { rows: [], loading: true },
};

export const Empty: Story = {
	name: 'Leeg',
	args: { rows: [], loading: false },
};

export const WithExceptions: Story = {
	name: 'Met uitzonderingen',
	args: { rows: [rows[2]!], loading: false },
};
