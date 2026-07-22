import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TeamStatusWidget from '@/components/dashboard/home/TeamStatusWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <TeamStatusWidget session={session} /> : null;
};

const meta: Meta<typeof TeamStatusWidget> = {
	title: 'Dashboard/Home/TeamStatusWidget',
	component: TeamStatusWidget,
	parameters: {
		docs: {
			description: {
				component:
					'Unfilled shifts across the upcoming conventions, for staff managers: one row per convention with its open count, toned warning or negative by how many are open. Folds `event_shifts` without a subject onto the upcoming `events`.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof TeamStatusWidget>;

export const Default: Story = {};
