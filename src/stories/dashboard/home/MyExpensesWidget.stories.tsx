import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MyExpensesWidget from '@/components/dashboard/home/MyExpensesWidget';
import { useSession } from '@/lib/auth/permissions';

// The widget takes the live session as a prop; in Storybook that is the one the Supabase stand-in hands out.
const WithSession = () => {
	const { session } = useSession();
	return session ? <MyExpensesWidget session={session} /> : null;
};

const meta: Meta<typeof MyExpensesWidget> = {
	title: 'Dashboard/Home/MyExpensesWidget',
	component: MyExpensesWidget,
	parameters: {
		docs: {
			description: {
				component:
					'The member’s four most recent declaraties with date, amount and review status. Reads `expenses` scoped to the signed-in user (managers may read every row, so the widget scopes to self explicitly), newest first.',
			},
		},
	},
	render: () => <WithSession />,
};

export default meta;

type Story = StoryObj<typeof MyExpensesWidget>;

export const Default: Story = {};
