import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventEditor from '@/components/dashboard/events/EventEditor';

const meta: Meta<typeof EventEditor> = {
	title: 'Dashboard/Events/EventEditor',
	component: EventEditor,
	parameters: {
		layout: 'fullscreen',
		// The editor reads the convention from ?id=; production is a static export, so the section routes
		// on a query param instead of a [id] segment. Storybook's App Router mock supplies it here.
		nextjs: { appDirectory: true, navigation: { query: { id: 'evt-1' } } },
		docs: {
			description: {
				component:
					'One convention across eight tabs (Info · Aanwezigheid · Agenda · Activiteiten · Kosten · Evaluatie · Items & tickets · Post), with the prep cockpit on top whose tiles jump to the tab that owns them. Requires `inventory.manage`; the € tile and the Kosten table additionally need `expenses.manage`. Fed by the Storybook fixtures for Abunai! 2026.',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof EventEditor>;

export const Default: Story = {};
