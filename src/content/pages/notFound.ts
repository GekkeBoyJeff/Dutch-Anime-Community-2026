import type { Page } from '@/lib/content';

// The 404 page, authored as content blocks like any other page — but kept OUT of the routable registry
// (pages/index.ts) on purpose: not-found.tsx loads it via getNotFoundPage(), so it never becomes a real
// route or a sitemap entry. Edit the copy here; rendering goes through the same <Blocks> pipeline.
export const notFoundPage: Page = {
	meta: {
		title: '404 — pagina niet gevonden',
		description: 'Deze pagina bestaat niet (meer).',
	},
	blocks: [
		{
			type: 'hero',
			id: 'intro',
			title: 'Oeps — deze pagina bestaat niet',
			text: 'Amelia heeft overal gezocht, maar hier is echt niks te vinden. De homepagina helpt je weer op weg — of kom gewoon even hoi zeggen op Discord.',
			actions: [
				{ label: 'Terug naar home', variant: 'primary', url: '/' },
				{ label: 'Word lid', variant: 'ghost', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			],
		},
	],
};
