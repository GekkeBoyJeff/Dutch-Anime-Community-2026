import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventLogisticsPanel, { type EventAssignmentRow, type EventTicketRow } from '@/components/dashboard/components/EventLogisticsPanel';

const noop = () => {};

const assignments: EventAssignmentRow[] = [
	{ id: 'a1', item: 'Beamer', person: 'Jeffrey', quantity: 1, expectedToBring: true, notes: 'Incl. HDMI-kabel' },
	{ id: 'a2', item: 'Verlengsnoeren', person: 'Mila', quantity: 4, expectedToBring: true, notes: null },
	{ id: 'a3', item: 'Kassa', person: 'Extern (huur)', quantity: 1, expectedToBring: false, notes: 'Wordt geleverd' },
];

const tickets: EventTicketRow[] = [
	{ id: 't1', day: '2026-08-15', person: 'Jeffrey', quantity: 2, detail: 'PDF' },
	{ id: 't2', day: '2026-08-16', person: 'Tom', quantity: 1, detail: 'Wordt per bandje op de dag zelf geregeld' },
];

const meta: Meta<typeof EventLogisticsPanel> = {
	title: 'Dashboard/Components/EventLogisticsPanel',
	component: EventLogisticsPanel,
	parameters: {
		docs: {
			description: {
				component:
					'Per-convention logistics: a table of items assigned to people (to bring) and a table of per-day tickets. Presentational — the caller owns the queries, the assign/ticket forms and the PDF upload.',
			},
		},
	},
	args: {
		eventName: 'Dutch Anime Con 2026',
		assignments,
		tickets,
		onClose: noop,
		onAddAssignment: noop,
		onAddTicket: noop,
		onDeleteAssignment: noop,
		onDeleteTicket: noop,
	},
	decorators: [(Story) => <div className="inventory"><Story /></div>],
};

export default meta;

type Story = StoryObj<typeof EventLogisticsPanel>;

export const Default: Story = {};

export const Empty: Story = {
	name: 'Leeg',
	args: { assignments: [], tickets: [] },
};

export const AssignmentsOnly: Story = {
	name: 'Alleen items',
	args: { tickets: [] },
};
