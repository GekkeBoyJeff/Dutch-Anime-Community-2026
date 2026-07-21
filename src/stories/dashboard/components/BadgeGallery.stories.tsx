import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Panel from '@/components/components/Panel';
import BadgeGallery from '@/components/dashboard/components/BadgeGallery';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof BadgeGallery> = {
	title: 'Dashboard/Components/BadgeGallery',
	component: BadgeGallery,
	parameters: {
		docs: {
			description: {
				component:
					'A small strip of earned badges: a round thumbnail per badge, falling back to its first initial when it has no image. Presentational — the caller resolves storage URLs and owns the RPC fetch (see the dashboard home\'s BadgesShowcase wrapper).',
			},
		},
	},
};

export default meta;

type Story = StoryObj<typeof BadgeGallery>;

export const Default: Story = {
	args: {
		badges: [
			{ title: 'Oprichter', imageUrl: demoImage.src },
			{ title: 'Vrijwilliger', imageUrl: demoImage.src },
			{ title: 'Eventcrew' },
		],
	},
};

export const InPanel: Story = {
	name: 'In a panel',
	parameters: {
		docs: { description: { story: 'How the dashboard home mounts it: the owning Panel carries the title, the deep link and the empty state, so the gallery itself stays purely presentational.' } },
	},
	render: () => (
		<Panel title="Mijn badges" href="/account" linkLabel="Naar mijn profiel">
			<BadgeGallery badges={[{ title: 'Oprichter', imageUrl: demoImage.src }, { title: 'Vrijwilliger', imageUrl: demoImage.src }, { title: 'Eventcrew' }]} />
		</Panel>
	),
};

export const Empty: Story = {
	args: {
		badges: [],
	},
};

export const WithoutImage: Story = {
	name: 'Without image',
	args: {
		badges: [{ title: 'Oprichter' }, { title: 'Vrijwilliger' }, { title: 'Eventcrew' }],
	},
};
