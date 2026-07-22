import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PublishStatusWidget from '@/components/dashboard/home/PublishStatusWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <PublishStatusWidget session={session} /> : null;
};

const meta: Meta<typeof PublishStatusWidget> = {
	title: 'Dashboard/Home/PublishStatusWidget',
	component: PublishStatusWidget,
	parameters: {
		docs: {
			description: {
				component:
					'Content status for authors: how many pages were edited in the last fortnight, when the site was last touched, and a button straight into the publish flow. Reads the `pages` table only — the schema has no publish anchor, so recent edits are the honest proxy.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof PublishStatusWidget>;

export const Default: Story = {};
