import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventsRouter from '@/components/dashboard/events/EventsRouter';

const meta: Meta<typeof EventsRouter> = {
	title: 'Dashboard/Events/EventsRouter',
	component: EventsRouter,
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'The whole `/dashboard/events` section is one route that switches on the `id` query param: without it the landing, with it the tabbed editor. It renders nothing of its own, so a story only shows something once the App Router mock is given a query — see the two stories below.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof EventsRouter>;

export const Default: Story = {
	parameters: {
		nextjs: { appDirectory: true, navigation: { query: {} } },
		docs: { description: { story: 'No `?id=` — the section lands on the convention overview.' } },
	},
};

export const WithEventId: Story = {
	parameters: {
		nextjs: { appDirectory: true, navigation: { query: { id: 'evt-1' } } },
		docs: { description: { story: '`?id=evt-1` — the same route resolves to the editor for Abunai! 2026.' } },
	},
};
