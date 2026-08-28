import type { Page } from '@/lib/site/content';

// The 404 page, authored as content blocks like any other page — but kept OUT of the routable registry
// (pages/index.ts) on purpose: not-found.tsx loads it via getNotFoundPage(), so it never becomes a real
// route or a sitemap entry. Edit the copy here; rendering goes through the same <Blocks> pipeline.
export const notFoundPage: Page = {
	meta: {
		title: 'Deze pagina bestaat niet',
		description: 'Deze pagina bestaat niet (meer).',
	},
	blocks: [
		{
			type: 'hero',
			id: 'intro',
			title: 'Oeps. Deze pagina bestaat niet.',
			value: 'Amelia heeft overal gezocht. Niks.',
			actions: [
				{ value: 'Terug naar home', variant: 'primary', url: '/' },
				{ value: 'Word lid', variant: 'ghost', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			],
		},
	],
};
