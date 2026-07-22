import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import RecentMediaWidget from '@/components/dashboard/home/RecentMediaWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <RecentMediaWidget session={session} /> : null;
};

const meta: Meta<typeof RecentMediaWidget> = {
	title: 'Dashboard/Home/RecentMediaWidget',
	component: RecentMediaWidget,
	parameters: {
		docs: {
			description: {
				component:
					'A thumbnail strip of the six most recently uploaded images, for media managers. Lists the public `media` bucket newest first and resolves a public URL per object; the Storybook stand-in returns placeholder URLs, so the tiles show their file names rather than real artwork.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof RecentMediaWidget>;

export const Default: Story = {};
