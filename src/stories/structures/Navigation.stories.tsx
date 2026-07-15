import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Navigation from '@/components/structures/Navigation';
import { NavigationProps } from '@/lib/content/schema/structures/navigation';

const meta: Meta<typeof Navigation> = {
	title: 'Structures/Navigation',
	component: Navigation,
	parameters: {
		layout: 'fullscreen',
		docs: { description: { component: 'Generalised site header: brand, desktop links, a CTA and a mobile menu. The shell is a Server Component; only the mobile toggle is a small client island. Drive all content from site.ts.' } },
		jsonSchema: { schema: NavigationProps },
	},
	argTypes: {
		items: { control: 'object' },
		cta: { control: 'object' },
		brand: { control: 'object' },
	},
};

export default meta;

type Story = StoryObj<typeof Navigation>;

export const Default: Story = {
	args: {
		brand: { title: 'Dutch Anime Community' },
		items: [
			{ label: 'Home', url: '/' },
			{ label: 'Community', url: '/community' },
			{ label: 'Evenementen', url: '/evenementen' },
		],
		cta: { label: 'Word lid', url: '/word-lid', variant: 'primary' },
	},
};

export const WithoutCta: Story = {
	...Default,
	args: {
		...Default.args,
		cta: undefined,
	},
};
