import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import TicketViewer from '@/components/dashboard/moderation/TicketViewer';

const meta: Meta<typeof TicketViewer> = {
	title: 'Dashboard/Moderation/TicketViewer',
	component: TicketViewer,
	parameters: {
		docs: {
			description: {
				component:
					'A stored ticket, read-only: the header line with the message count and period, then the messages through the generic `ChatTranscript`. `ticketId` doubles as the open state (`null` = closed); while the loaded ticket lags behind it the drawer shows a spinner instead of the previous ticket’s messages.',
			},
		},
	},
	args: { ticketId: 'tkt-1' },
};

export default meta;

type Story = StoryObj<typeof TicketViewer>;

export const Default: Story = {};
