import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MemberShiftAgenda from '@/components/dashboard/my-inventory/MemberShiftAgenda';
import { useDashboardGuard } from '@/hooks/useDashboardGuard';

// The agenda is handed the session MyInventory already resolved; the guard supplies the real one from
// the Storybook Supabase stand-in.
const MemberShiftAgendaHost = () => {
	const { ready, fallback, session } = useDashboardGuard('inventory.view', { className: 'inventory', label: 'Laden' });
	if (!ready || !session) return fallback;
	return <MemberShiftAgenda session={session} />;
};

const meta: Meta<typeof MemberShiftAgenda> = {
	title: 'Dashboard/MyInventory/MemberShiftAgenda',
	component: MemberShiftAgenda,
	parameters: {
		docs: {
			description: {
				component:
					'A member\'s own shift week: every shift of the conventions they are rostered on, with their own marked. Selecting a block opens a drawer with the shift as a single Moment (day marker, time range, colleague and station), any pending swap requests, and — for an unlocked shift of your own — the form to offer it to a colleague. All mutations run through the existing swap RPCs.',
			},
		},
	},
	render: () => <MemberShiftAgendaHost />,
};

export default meta;

type Story = StoryObj<typeof MemberShiftAgenda>;

export const Default: Story = {};
