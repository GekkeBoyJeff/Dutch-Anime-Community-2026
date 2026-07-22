import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AccessManager from '@/components/dashboard/access/AccessManager';

const meta: Meta<typeof AccessManager> = {
	title: 'Dashboard/Access/AccessManager',
	component: AccessManager,
	globals: { role: 'admin' },
	parameters: {
		docs: {
			description: {
				component:
					'Role assignment and per-user permission grants. Only an admin holds `roles.manage`, so the screen renders under the **Beheerder** role — switch the **Rol** toolbar to anything else and it redirects instead. Open a row to see the role picker and the permission groups; the checked-by-role boxes come from the `role_permissions` fixture.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof AccessManager>;

export const Default: Story = {};
