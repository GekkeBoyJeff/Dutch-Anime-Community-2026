import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EntryTicketWidget from '@/components/dashboard/home/EntryTicketWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <EntryTicketWidget session={session} /> : null;
};

const meta: Meta<typeof EntryTicketWidget> = {
	title: 'Dashboard/Home/EntryTicketWidget',
	component: EntryTicketWidget,
	parameters: {
		docs: {
			description: {
				component:
					'Entry and ticket info for the member’s soonest upcoming convention — one row per day, either a downloadable ticket or a wristband note. Reads `event_tickets` assigned to the signed-in user and opens each PDF through a signed URL on the private `tickets` bucket.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof EntryTicketWidget>;

export const Default: Story = {};
