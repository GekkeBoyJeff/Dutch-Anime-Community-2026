import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Moment from '@/components/components/Moment';
import { MomentProps } from '@/lib/site/content/schema/components/moment';

const meta: Meta<typeof Moment> = {
	title: 'Components/Moment',
	component: Moment,
	parameters: {
		docs: {
			description: {
				component:
					'Something happening at a point in time. Stacked inside Moment.List the markers and their connecting segments become a timeline, so order and the gaps between entries are visible without comparing dates.',
			},
		},
		jsonSchema: { schema: MomentProps },
	},
	argTypes: {
		state: { control: 'inline-radio', options: ['past', 'now', 'upcoming'] },
		tone: { control: 'inline-radio', options: ['neutral', 'positive', 'warning', 'negative'] },
		loading: { control: 'boolean' },
	},
	render: (args) => <Moment.List items={[args]} />,
};

export default meta;

type Story = StoryObj<typeof Moment>;

export const Default: Story = {
	args: { marker: '22 aug', title: 'Abunai!', meta: 'Nijmegen · opbouw vanaf 08:00' },
};

export const Loading: Story = {
	args: { marker: '22 aug', title: 'Abunai!', meta: 'Nijmegen', loading: true },
};

export const Timeline: Story = {
	render: () => (
		<Moment.List
			items={[
				{ marker: '12 jul', title: 'Animecon', meta: 'Den Haag', state: 'past' },
				{ marker: 'vandaag', title: 'Inpakken stand', meta: '14:00–16:00 · magazijn', state: 'now', tone: 'warning' },
				{ marker: '22 aug', title: 'Abunai!', meta: 'Nijmegen · opbouw vanaf 08:00', state: 'upcoming' },
				{ marker: '4 okt', title: 'Dokomi NL', meta: 'Locatie nog onbekend', state: 'upcoming' },
			]}
		/>
	),
};
