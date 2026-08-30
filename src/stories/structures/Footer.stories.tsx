import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Footer from '@/components/structures/Footer';
import { FooterProps } from '@/lib/site/content/schema/structures/footer';

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
				title: 'Community',
				links: [
					{ value: 'Wat we doen', url: '/community' },
					{ value: 'Evenementen', url: '/evenementen' },
					{ value: 'Word lid', url: '/word-lid' },
				],
			},
			{
				title: 'Ontdek',
				links: [
					{ value: 'Home', url: '/' },
					{ value: 'Join de Discord', url: 'https://discord.gg/dutchanimecommunity' },
				],
			},
		],
		socialLinks: [
			{ label: 'Discord', url: 'https://discord.gg/dutchanimecommunity' },
			{ label: 'Instagram', url: 'https://www.instagram.com/dutchanimecommunity/' },
			{ label: 'TikTok', url: 'https://www.tiktok.com/@dutchanimecommunity' },
		],
		legalLinks: [
			{ value: 'Privacy', url: '/privacy' },
			{ value: 'Voorwaarden', url: '/voorwaarden' },
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
		legalLinks: [{ value: 'Privacy', url: '/privacy' }],
		credit: undefined,
	},
};
