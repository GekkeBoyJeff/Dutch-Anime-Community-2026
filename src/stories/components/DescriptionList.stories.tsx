import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import DescriptionList from '@/components/components/DescriptionList';
import { DescriptionListProps } from '@/lib/content/schema/components/descriptionList';

const meta: Meta<typeof DescriptionList> = {
	title: 'Components/DescriptionList',
	component: DescriptionList,
	parameters: {
		docs: { description: { component: 'Semantic `<dl>` term/definition pairs for spec and detail panels — event detail pages like date, venue, price and organizer. Pure CSS, server-safe.' } },
		jsonSchema: { schema: DescriptionListProps },
	},
	argTypes: {
		layout: { control: 'inline-radio', options: ['stacked', 'inline'] },
		divided: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof DescriptionList>;

export const Default: Story = {
	args: {
		items: [
			{ term: 'Date', description: 'Saturday 12 April 2026' },
			{ term: 'Venue', description: 'Jaarbeurs, Utrecht' },
			{ term: 'Price', description: '&euro;24,50' },
			{ term: 'Organizer', description: 'Dutch Anime Community' },
		],
	},
};

export const Inline: Story = {
	...Default,
	args: {
		...Default.args,
		layout: 'inline'
	}
};

export const Divided: Story = {
	...Default,
	args: {
		...Default.args,
		layout: 'inline',
		divided: true
	}
};
