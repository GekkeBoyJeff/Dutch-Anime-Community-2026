import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BetrokkenenPanel from '@/components/dashboard/moderation/BetrokkenenPanel';

const meta: Meta<typeof BetrokkenenPanel> = {
	title: 'Dashboard/Moderation/BetrokkenenPanel',
	component: BetrokkenenPanel,
	parameters: {
		docs: {
			description: {
				component:
					'The read-only context strip on a moderation profile: where this person shows up across the platform — recent conventions, stand shifts, and the people they shared support tickets with — each row deep-linking to the surface that owns it. A peer without a mod subject of their own is rendered as static text instead of a link. With nothing in any of the three columns the panel renders nothing at all.',
			},
		},
	},
	decorators: [
		(Story) => (
			<div className="moderation">
				<Story />
			</div>
		),
	],
	args: {
		events: [
			{ eventId: 'evt-3', eventName: 'Animecon 2026', status: 'confirmed' },
			{ eventId: 'evt-1', eventName: 'Abunai! 2026', status: 'invited' },
		],
		shifts: [
			{ id: 'shf-1', eventId: 'evt-1', eventName: 'Abunai! 2026', startsAt: '2026-08-22T10:00:00.000Z', station: 'Stand A' },
			{ id: 'shf-2', eventId: 'evt-1', eventName: 'Abunai! 2026', startsAt: '2026-08-23T13:00:00.000Z', station: null },
		],
		peers: [
			{ subjectId: 'sub-0002', name: 'Sanne Bakker', tickets: 2 },
			{ subjectId: null, name: 'DAC Bot', tickets: 1 },
		],
	},
};

export default meta;

type Story = StoryObj<typeof BetrokkenenPanel>;

export const Default: Story = {};

export const EenKolomLeeg: Story = {
	name: 'Eén kolom leeg',
	args: { shifts: [] },
};
