import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import { emphasisRole, orderedWidgets } from '@/components/dashboard/home/registry';
import BeheerZone from '@/components/dashboard/shell/BeheerZone';
import { usePermissions } from '@/lib/auth/permissions';

const meta: Meta<typeof BeheerZone> = {
	title: 'Dashboard/Shell/BeheerZone',
	component: BeheerZone,
	parameters: {
		docs: {
			description: {
				component:
					'The admin-only "Beheer" surface: the org widgets folded into collapsible Operatie / Content / Systeem groups instead of one flat pile, with Systeem dimmed, and each group\'s open state remembered in localStorage. Only the admin home mounts this — every other role keeps the flat grid. Set the **Rol** toolbar to Beheerder to see all three groups; on Yakuza only Operatie has widgets, and on Standteam the zone renders nothing at all. Note what this story shows today: every group mounts collapsed and "Toon alles" only flips its own label, because the `open` prop BeheerZone passes down is not honoured — a group opens only when you click its own header.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof BeheerZone>;

// The widgets and session are what DashboardShell would hand it: the org-zone slice of the widgets this
// role may see, ordered for that role's emphasis.
export const Default: Story = {
	render: function Render() {
		const { permissions, session } = usePermissions();
		if (!session) return <p>Sessie laden…</p>;
		const org = orderedWidgets(permissions, emphasisRole(permissions)).filter((widget) => widget.zone === 'org');
		return <BeheerZone widgets={org} session={session} />;
	},
};
