import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import EventCard from '@/components/components/EventCard';
import { EventCardProps } from '@/lib/content/schema/components/eventCard';
import { demoImage } from '@/stories/basics/Media.stories';

const meta: Meta<typeof EventCard> = {
	title: 'Components/EventCard',
	component: EventCard,
	parameters: {
		docs: {
			description: {
				component:
					'Event card: a standout date chip, title, summary, time range and location, plus an optional status badge and lead media. A Server Component, whole-card-clickable via a stretched link.',
			},
		},
		jsonSchema: { schema: EventCardProps },
	},
	argTypes: {
		statusVariant: {
			control: 'inline-radio',
			options: ['neutral', 'primary', 'info', 'success', 'warning', 'error'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof EventCard>;

export const Default: Story = {
	args: {
		title: 'Spelletjesmiddag Utrecht',
		summary: 'Een middag vol bordspellen, kaartspellen en vooral veel gezelligheid met andere leden.',
		startDate: '2026-09-12T13:00:00Z',
		endDate: '2026-09-12T17:00:00Z',
		location: 'Utrecht',
		status: 'Gratis',
		statusVariant: 'success',
		href: '/evenementen',
		translations: {
			timeLabel: 'Tijd',
			locationLabel: 'Locatie',
		},
	},
};

export const WithMedia: Story = {
	...Default,
	args: {
		...Default.args,
		media: {
			...demoImage,
			src: '/media/spelletjesmiddag.jpg',
			alt: 'Leden spelen bordspellen tijdens een DAC-spelletjesmiddag',
			ratio: '16/9',
		},
	},
};

export const SoldOut: Story = {
	...Default,
	args: { ...Default.args, status: 'Uitverkocht', statusVariant: 'error' },
};

export const NoStatus: Story = {
	...Default,
	args: {
		...Default.args,
		status: undefined
	}
};

export const Online: Story = {
	...Default,
	args: {
		...Default.args,
		title: 'Watch party: seizoensfinale',
		summary: 'Kijk samen met de community de seizoensfinale, live in de Discord.',
		startDate: '2026-09-18T19:00:00Z',
		endDate: '2026-09-18T21:30:00Z',
		location: 'Online (Discord)',
		status: 'Online',
		statusVariant: 'info',
		href: 'https://discord.gg/dutchanimecommunity',
	},
};
