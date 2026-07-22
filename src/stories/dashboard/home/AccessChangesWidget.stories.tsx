import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import AccessChangesWidget from '@/components/dashboard/home/AccessChangesWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <AccessChangesWidget session={session} /> : null;
};

const meta: Meta<typeof AccessChangesWidget> = {
	title: 'Dashboard/Home/AccessChangesWidget',
	component: AccessChangesWidget,
	parameters: {
		docs: {
			description: {
				component:
					'The six most recently granted per-user permission exceptions, for access managers: who got which permission, and when. Reads `user_permissions` and resolves the member names from `profiles`; it hides itself when nothing has been granted.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof AccessChangesWidget>;

export const Default: Story = {};
