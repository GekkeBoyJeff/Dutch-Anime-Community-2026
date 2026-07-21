import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Skeleton from '@/components/basics/Skeleton';
import ConventionInvolvementCard, {
	type ConventionAssignment,
	type ConventionShift,
	type ConventionTicket,
} from '@/components/dashboard/components/ConventionInvolvementCard';

const noop = () => {};

const assignments: ConventionAssignment[] = [
	{ id: 'a1', name: 'Cosplay-standaard', quantity: 2, expectedToBring: true, notes: 'Incl. klemmen', packed: true },
	{ id: 'a2', name: 'Verlengsnoer', quantity: 1, expectedToBring: true, notes: null, packed: false },
	{ id: 'a3', name: 'Reserve-badges', quantity: 20, expectedToBring: false, notes: 'Alleen als er ruimte is', packed: false },
];

const tickets: ConventionTicket[] = [
	{ id: 't1', day: 'Zaterdag', quantity: 2, pdfPath: 'tickets/demo.pdf', note: null },
	{ id: 't2', day: 'Zondag', quantity: 1, pdfPath: null, note: 'Wordt per bandje op de dag zelf geregeld.' },
];

const shifts: ConventionShift[] = [
	{ id: 's1', time: 'za 10:00 – 14:00', station: 'Kassa' },
	{ id: 's2', time: 'zo 13:00 – 17:00', station: null },
];

const meta: Meta<typeof ConventionInvolvementCard> = {
	title: 'Dashboard/Components/ConventionInvolvementCard',
	component: ConventionInvolvementCard,
	parameters: {
		docs: {
			description: {
				component:
					'One convention\'s personal involvement: the items you must bring (with a packed toggle), the tickets you hold (download or a fallback note) and your shifts. Presentational — display names, event name and time ranges are resolved by the caller.',
			},
		},
	},
	args: {
		eventName: 'Dutch Anime Con 2026',
		assignments,
		tickets,
		shifts,
		onTogglePacked: noop,
		onDownloadTicket: noop,
	},
	decorators: [(Story) => <div className="con-groups"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof ConventionInvolvementCard>;

export const Default: Story = {};

export const AssignmentsOnly: Story = {
	name: 'Alleen meenemen',
	args: { tickets: [], shifts: [] },
};

export const TicketsOnly: Story = {
	name: 'Alleen tickets',
	args: { assignments: [], shifts: [] },
};

export const Loading: Story = {
	name: 'Laden',
	render: () => (
		<div className="con-groups" aria-hidden="true">
			{[0, 1].map((i) => (
				<article key={i} className="con-group">
					<Skeleton width="50%" height="1.1rem" />
					<Skeleton width="100%" height="4.5rem" radius="m" />
				</article>
			))}
		</div>
	),
};
