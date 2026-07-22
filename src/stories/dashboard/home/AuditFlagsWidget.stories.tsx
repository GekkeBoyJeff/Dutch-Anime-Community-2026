import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AuditFlagsWidget from '@/components/dashboard/home/AuditFlagsWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <AuditFlagsWidget session={session} /> : null;
};

const meta: Meta<typeof AuditFlagsWidget> = {
	title: 'Dashboard/Home/AuditFlagsWidget',
	component: AuditFlagsWidget,
	parameters: {
		docs: {
			description: {
				component:
					'A compact echo of the audit log for staff with `logs.view`: what changed, in which table, when. Reads `audit_log` newest first and collapses repeated edits to the same record to their latest row, so autosave never floods the panel.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof AuditFlagsWidget>;

export const Default: Story = {};
