import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import ProfileCards from '@/components/contentBlocks/ProfileCards';
import { ProfileCardsProps } from '@/lib/content/schema/blocks/profileCards';
import { demoImage } from '@/stories/basics/Media.stories';

const portrait = demoImage.src;

const meta: Meta<typeof ProfileCards> = {
	title: 'ContentBlocks/ProfileCards',
	component: ProfileCards,
	parameters: {
		docs: { description: { component: 'A wall of profile cards: a 4:5 portrait, a name and role, an optional bio and a row of social links. Generic by design — no domain coupling.' } },
		jsonSchema: { schema: ProfileCardsProps },
	},
	argTypes: {
		columns: { control: 'inline-radio', options: [2, 3, 4] },
		colorset: { control: 'inline-radio', options: ['light', 'dark'] },
	},
};

export default meta;

type Story = StoryObj<typeof ProfileCards>;

export const Default: Story = {
	args: {
		heading: { value: 'De crew achter DAC', tagline: 'Team', intro: 'De moderators en organisatoren die de community draaiende houden.' },
		columns: 3,
		items: [
			{ id: 'p1', image: portrait, name: 'Sanne Bakker', role: 'Oprichter', text: 'Startte DAC in 2019 en bewaakt de gezelligheid.', socials: [{ label: 'Discord', url: 'https://discord.gg/dutchanimecommunity', icon: 'external' }] },
			{ id: 'p2', image: portrait, name: 'Jesse de Vries', role: 'Events', text: 'Regelt de meetups en de stand op de cons.' },
			{ id: 'p3', image: portrait, name: 'Yuki van Dam', role: 'Moderatie', text: 'Houdt de server veilig en de chat leuk.', socials: [{ label: 'Instagram', url: 'https://www.instagram.com/dutchanimecommunity/', icon: 'external' }] },
			{ id: 'p4', image: portrait, name: 'Mila Peters', role: 'Art & cosplay', text: 'Organiseert de art-challenges en cosplay-shoots.' },
		],
	},
};

export const FourColumns: Story = {
	...Default,
	args: {
		...Default.args,
		columns: 4,
	},
};
