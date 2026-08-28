import type { Meta, StoryObj } from '@storybook/nextjs-vite';
import { useState } from 'react';

import PermissionGroups from '@/components/components/PermissionGroups';
import type { Permission } from '@/lib/shared/auth/permissions';

const meta: Meta<typeof PermissionGroups> = {
	title: 'Components/PermissionGroups',
	component: PermissionGroups,
	parameters: {
		docs: {
			description: {
				component:
					'Groepeert het permissie-vocabulaire per domein met een Switch per permissie — de volledige, per-persoon effectieve set (user_permissions). Drijft het Toegang-detailpaneel.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof PermissionGroups>;

// Interactief: elke toggle zet/haalt een permissie in de per-persoon set.
export const Default: Story = {
	render: () => {
		const Demo = () => {
			const [grants, setGrants] = useState<Set<Permission>>(new Set(['pages.edit', 'media.upload']));
			return (
				<PermissionGroups
					grants={grants}
					onToggle={(permission, on) =>
						setGrants((prev) => {
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

// Alles alleen-lezen (bv. je eigen rij of een admin-doelwit): toggles zijn zichtbaar maar geblokkeerd.
export const ReadOnly: Story = {
	render: () => <PermissionGroups grants={new Set(['inventory.view', 'inventory.manage'])} onToggle={() => {}} disabled />,
};
