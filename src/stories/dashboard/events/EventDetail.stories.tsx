import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventDetail from '@/components/dashboard/events/EventDetail';

const meta: Meta<typeof EventDetail> = {
	title: 'Dashboard/Events/EventDetail',
	component: EventDetail,
	args: {
		event: { id: 'evt-1', name: 'Abunai! 2026' },
		items: [
			{ id: 'itm-1', name: 'Katana replica' },
			{ id: 'itm-2', name: 'Banner groot' },
			{ id: 'itm-3', name: 'Kassalade' },
		],
		users: [
			{ id: 'usr-0001', username: 'gekkeboyjeff' },
			{ id: 'usr-0002', username: 'sannebakker' },
		],
	},
	parameters: {
		docs: {
			description: {
				component:
					'The "Items & tickets" tab of the event editor: which inventory items someone is expected to bring, and the per-day tickets (optionally with a PDF in the private bucket). The tables themselves live in `EventLogisticsPanel`; this component owns the fetching and the two add dialogs.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof EventDetail>;

export const Default: Story = {};
