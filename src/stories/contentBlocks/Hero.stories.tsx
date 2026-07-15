import type { Meta, StoryObj } from '@storybook/nextjs-vite';

import Hero from '@/components/contentBlocks/Hero';
import { HeroProps } from '@/lib/content/schema/blocks/hero';

const meta: Meta<typeof Hero> = {
	title: 'ContentBlocks/Hero',
	component: Hero,
	parameters: {
		docs: { description: { component: 'Header section of a page: tagline, title, intro and a row of call-to-action buttons (Actions → Button, with the badged arrow on the primary CTA) — rendered plain, inside a rounded media panel with quick stats (Stat), or as a full-bleed cover with a glass stats bar.' } },
		jsonSchema: { schema: HeroProps },
	},
	argTypes: {
		colorset: {
			control: 'inline-radio',
			options: ['light', 'dark'],
		},
	},
};

export default meta;

type Story = StoryObj<typeof Hero>;

export const Default: Story = {
	args: {
		title: 'Vind je crew. Kijk samen. Voel je thuis.',
		text: 'De grootste Nederlandstalige anime- en mangacommunity — voor en door fans. Bij ons is er altijd iemand online en altijd een plek voor jou.',
		actions: [
			{ label: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			{ label: 'Bekijk evenementen', variant: 'secondary', url: '/evenementen' },
			{ label: 'Hoe werkt het?', variant: 'ghost', url: '/word-lid' },
		],
	},
};

export const MediaPanel: Story = {
	args: {
		...Default.args,
		tagline: 'De gezelligste anime-community van Nederland',
		media: { type: 'image', src: '/media/dac-meetup.png', alt: 'DAC-leden samen op een meetup' },
		stats: [
			{ count: '4.500+', label: 'leden' },
			{ count: '1.000+', label: 'tegelijk online' },
			{ count: '4', label: 'cons per jaar' },
			{ count: '100%', label: 'gratis' },
		],
	},
};

export const Cover: Story = {
	args: {
		...MediaPanel.args,
		variant: 'cover',
		socials: [
			{ label: 'Discord', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			{ label: 'Instagram', url: 'https://www.instagram.com/dutchanimecommunity/', target: '_blank' },
			{ label: 'TikTok', url: 'https://www.tiktok.com/@dutchanimecommunity', target: '_blank' },
		],
	},
	parameters: { layout: 'fullscreen' },
};
