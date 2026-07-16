import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import PermissionGroups from '@/components/components/PermissionGroups';
import type { Permission } from '@/lib/auth/permissions';

const meta: Meta<typeof PermissionGroups> = {
	title: 'Components/PermissionGroups',
	component: PermissionGroups,
	parameters: {
		docs: {
			description: {
				component:
					"Groepeert het permissie-vocabulaire per domein met een Switch per permissie. Wat de rol al dekt staat als 'via rol' (aan + niet-bewerkbaar); de rest is een per-persoon-toggle (additief bovenop de rol). Drijft het Toegang-detailpaneel.",
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof PermissionGroups>;

// Interactief: 'via rol'-permissies staan vast aan; de per-persoon-toggles updaten live.
export const Default: Story = {
	render: () => {
		const Demo = () => {
			const roleGrants: ReadonlySet<Permission> = new Set(['pages.edit', 'pages.delete']);
			const [userGrants, setUserGrants] = useState<Set<Permission>>(new Set(['media.manage']));
			return (
				<PermissionGroups
					roleGrants={roleGrants}
					userGrants={userGrants}
					onToggle={(permission, on) =>
						setUserGrants((prev) => {
							const next = new Set(prev);
							if (on) next.add(permission);
							else next.delete(permission);
							return next;
						})
					}
				/>
			);
		};
		return <Demo />;
	},
};

// Alles alleen-lezen (bv. je eigen rij): toggles zijn zichtbaar maar geblokkeerd.
export const ReadOnly: Story = {
	render: () => (
		<PermissionGroups
			roleGrants={new Set(['inventory.view', 'inventory.manage'])}
			userGrants={new Set(['moderation.view'])}
			onToggle={() => {}}
			disabled
		/>
	),
};
