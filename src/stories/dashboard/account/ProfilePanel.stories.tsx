import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProfilePanel from '@/components/dashboard/account/ProfilePanel';

const meta: Meta<typeof ProfilePanel> = {
	title: 'Dashboard/Account/ProfilePanel',
	component: ProfilePanel,
	parameters: {
		docs: {
			description: {
				component:
					'"Mijn profiel" in full: the Discord card, open surveys, latest announcement, badges, own signals, filled-in surveys, notifications, donations and the sign-out row. Every read here is scoped to the caller by RLS or a SECURITY DEFINER RPC. Note that the **Rol** toolbar does not move this screen much: only the "Naar dashboard" button follows the toolbar\'s permissions, while the role chip and the editable organisation fields come from the caller\'s `user_roles` row — which the fixtures pin to yakuza. That row is also why the "Profiel" fields stay hidden here: `isStaffRole` compares against APP_ROLES, where `stand-staff` outranks `yakuza`.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof ProfilePanel>;

export const Default: Story = {};
