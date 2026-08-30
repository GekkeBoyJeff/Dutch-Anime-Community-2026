import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import MomentList from '@/components/contentBlocks/MomentList';
import { MomentListProps } from '@/lib/site/content/schema/blocks/momentList';

const meta: Meta<typeof MomentList> = {
	title: 'ContentBlocks/MomentList',
	component: MomentList,
	parameters: {
		docs: {
			description: {
				component:
					'A chronology on a rail: what has been, what is happening and what is coming. Past and upcoming are decided when the site is built, so an entry that has slipped by since the last publish keeps reading as upcoming — a neglected agenda stays visible instead of quietly correcting itself.',
			},
		},
		jsonSchema: { schema: MomentListProps },
	},
};

export default meta;

type Story = StoryObj<typeof MomentList>;

export const Default: Story = {
	args: {
		heading: { tagline: 'Agenda', title: 'Wat er speelt', intro: 'Wat we net deden en wat eraan komt.' },
		items: [
			{ id: 'm1', date: '2026-06-14', title: 'Meetup Utrecht', meta: '18 mensen, Neude' },
			{ id: 'm2', date: '2026-07-19', title: 'Watch party: Summer Wars', meta: 'Online, 40 kijkers' },
			{ id: 'm3', date: '2026-08-07', endDate: '2026-08-09', title: 'Abunai!', meta: 'Stand in de dealerroom' },
			{ id: 'm4', date: '2026-09-20', title: 'Herfstmeetup Rotterdam', meta: 'Aanmelden via Discord' },
			{ id: 'm5', date: '2026-11-14', endDate: '2026-11-15', title: 'Winter con', meta: 'Stand + cosplaywedstrijd' },
		],
	},
};
