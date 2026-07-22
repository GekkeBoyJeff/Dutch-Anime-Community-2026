import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import NextShiftWidget from '@/components/dashboard/home/NextShiftWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <NextShiftWidget session={session} /> : null;
};

const meta: Meta<typeof NextShiftWidget> = {
	title: 'Dashboard/Home/NextShiftWidget',
	component: NextShiftWidget,
	parameters: {
		docs: {
			description: {
				component:
					'The member’s next stand-duty shift: day marker, time range, convention and station. Resolves `my_subject_id()` and reads the first upcoming `event_shifts` row for that subject, then looks up the event name.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof NextShiftWidget>;

export const Default: Story = {};
