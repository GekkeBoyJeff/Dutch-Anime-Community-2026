import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import HomeHero from '@/components/dashboard/home/HomeHero';
import { usePermissions } from '@/lib/auth/permissions';

// The hero takes the live session and the caller's permissions, exactly as DashboardShell passes them.
const WithGuard = () => {
	const { session, permissions } = usePermissions();
	return session ? <HomeHero session={session} permissions={permissions} /> : null;
};

const meta: Meta<typeof HomeHero> = {
	title: 'Dashboard/Home/HomeHero',
	component: HomeHero,
	parameters: {
		docs: {
			description: {
				component:
					'The greeting that opens the staff hub: today’s date with the notification bell and avatar, a time-of-day greeting taken straight from the session, and one summary sentence plus the next-up card with inline quick actions. Sentence and card come from `useNextUp`, which walks a priority ladder over shifts, packing lists, declaraties, reviews, conventions and surveys — so switching the **Rol** toolbar changes which card wins.',
			},
		},
	},
	render: () => <WithGuard />,
};

export default meta;

type Story = StoryObj<typeof HomeHero>;

export const Default: Story = {};
