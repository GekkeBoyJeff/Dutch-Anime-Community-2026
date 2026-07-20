import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import BadgeGallery from '@/components/dashboard/components/BadgeGallery';
import AsyncCard from '@/components/dashboard/structures/AsyncCard';
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

export const Loading: Story = {
	name: 'Loading',
	parameters: {
		docs: { description: { story: 'BadgeGallery has no loading state of its own — the owning AsyncCard shows its skeleton while the badges load.' } },
	},
	render: () => <AsyncCard title="Mijn badges" loading />,
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
