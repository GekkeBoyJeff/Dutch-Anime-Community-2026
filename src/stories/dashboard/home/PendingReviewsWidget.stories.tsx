import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import PendingReviewsWidget from '@/components/dashboard/home/PendingReviewsWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <PendingReviewsWidget session={session} /> : null;
};

const meta: Meta<typeof PendingReviewsWidget> = {
	title: 'Dashboard/Home/PendingReviewsWidget',
	component: PendingReviewsWidget,
	parameters: {
		docs: {
			description: {
				component:
					'Declaraties waiting on a reviewer, for staff with `expenses.manage`: the total in the panel title and the oldest four below, deep-linking into the review tab. Reads submitted, non-archived `expenses`.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof PendingReviewsWidget>;

export const Default: Story = {};
