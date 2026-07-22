import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import UpcomingConventionWidget from '@/components/dashboard/home/UpcomingConventionWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <UpcomingConventionWidget session={session} /> : null;
};

const meta: Meta<typeof UpcomingConventionWidget> = {
	title: 'Dashboard/Home/UpcomingConventionWidget',
	component: UpcomingConventionWidget,
	parameters: {
		docs: {
			description: {
				component:
					'The single next convention on the calendar, for staff who manage conventions, deep-linking into that event’s editor. Reads the first upcoming non-archived `events` row; it hides itself entirely when the calendar is empty.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof UpcomingConventionWidget>;

export const Default: Story = {};
