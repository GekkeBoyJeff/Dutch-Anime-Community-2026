import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PackingListWidget from '@/components/dashboard/home/PackingListWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <PackingListWidget session={session} /> : null;
};

const meta: Meta<typeof PackingListWidget> = {
	title: 'Dashboard/Home/PackingListWidget',
	component: PackingListWidget,
	parameters: {
		docs: {
			description: {
				component:
					'A checkable packing list for the soonest convention the member must bring items to, with a progress meter on top. Reads `event_item_assignments` scoped to the signed-in user plus the `my_assignment_item_names` RPC; each switch flips optimistically and calls the `set_packed` RPC, which the Storybook stand-in accepts silently.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof PackingListWidget>;

export const Default: Story = {};
