import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventsTimelineWidget from '@/components/dashboard/home/EventsTimelineWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <EventsTimelineWidget session={session} /> : null;
};

const meta: Meta<typeof EventsTimelineWidget> = {
	title: 'Dashboard/Home/EventsTimelineWidget',
	component: EventsTimelineWidget,
	parameters: {
		docs: {
			description: {
				component:
					'The ambient “Rondom DAC” mini-timeline: the next four conventions on the calendar with their day marker and location. Reads upcoming, non-archived `events` — context everyone with `inventory.view` gets, and nobody has to act on.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof EventsTimelineWidget>;

export const Default: Story = {};
