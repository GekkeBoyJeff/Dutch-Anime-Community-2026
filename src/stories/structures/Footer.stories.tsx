import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Footer from '@/components/structures/Footer';
import { FooterProps } from '@/lib/content/schema/structures/footer';

const meta: Meta<typeof Footer> = {
	title: 'Structures/Footer',
	component: Footer,
	parameters: {
		layout: 'fullscreen',
		docs: { description: { component: 'Generalised site footer: brand block, link columns, social row and a legal bar with the copyright year (computed server-side). All content comes from props sourced from site.ts.' } },
		jsonSchema: { schema: FooterProps },
	},
	argTypes: {
		decorated: { control: 'boolean' },
	},
};

export default meta;

type Story = StoryObj<typeof Footer>;

export const Default: Story = {
	args: {
		brand: { title: 'Dutch Anime Community', tagline: 'De gezelligste anime-community van Nederland en België.' },
		navColumns: [
			{
				heading: 'Community',
				links: [
					{ label: 'Wat we doen', url: '/community' },
					{ label: 'Evenementen', url: '/evenementen' },
					{ label: 'Word lid', url: '/word-lid' },
				],
			},
			{
				heading: 'Ontdek',
				links: [
					{ label: 'Home', url: '/' },
					{ label: 'Join de Discord', url: 'https://discord.gg/dutchanimecommunity' },
				],
			},
		],
		socialLinks: [
			{ label: 'Discord', url: 'https://discord.gg/dutchanimecommunity' },
			{ label: 'Instagram', url: 'https://www.instagram.com/dutchanimecommunity/' },
			{ label: 'TikTok', url: 'https://www.tiktok.com/@dutchanimecommunity' },
		],
		legalLinks: [
			{ label: 'Privacy', url: '/privacy' },
			{ label: 'Voorwaarden', url: '/voorwaarden' },
		],
		credit: 'Gemaakt door de DAC-community',
	},
};

export const Decorated: Story = {
	...Default,
	args: {
		...Default.args,
		decorated: true,
	},
};

export const Minimal: Story = {
	...Default,
	args: {
		...Default.args,
		brand: { title: 'Dutch Anime Community' },
		navColumns: [],
		socialLinks: [],
		legalLinks: [{ label: 'Privacy', url: '/privacy' }],
		credit: undefined,
	},
};
