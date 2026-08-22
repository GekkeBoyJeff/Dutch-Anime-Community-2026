import type { Page } from '@/lib/content';

// De supporterspagina legt uit waar het geld heen gaat en wat er met je naam gebeurt. Namen van
// supporters staan hier bewust niet: die leven alleen in de CMS-rij, want deze map is getrackt in een
// publieke repo en een naam die er één keer in staat, blijft in de historie staan. De lijst bevat
// daarom precies één kaart, en dat is een complete lijst en geen lege staat.
// De Ko-fi-actie ontbreekt nog: er is geen URL aangeleverd, en een knop zonder bestemming is erger
// dan geen knop.
export const supportersPage: Page = {
	meta: {
		title: 'Supporters',
		description:
			'DAC draait op vrijwilligers. De stand, het drukwerk en de servers kosten geld, en dat leggen leden zelf bij. Hier lees je waar het heen gaat.',
	},
	blocks: [
		{
			type: 'ctaBanner',
			id: 'header',
			colorset: 'dark',
			tagline: 'Supporters',
			headline: 'Wie dit overeind houdt',
			subline: 'DAC draait op vrijwilligers en op een paar mensen die meebetalen.',
			media: { type: 'image', src: '/media/dac-stand.jpg', alt: 'De DAC-stand op een conventie' },
		},
		{
			type: 'titleText',
			id: 'waar-het-heen-gaat',
			colorset: 'light',
			align: 'start',
			heading: {
				tagline: 'Waar het heen gaat',
				value: 'Wat het kost',
			},
			text: '<p>Een stand op een con kost standhuur. Daarnaast is er de banner, het drukwerk, art prints om weg te geven, en bordspellen voor op tafel. De Minecraft-server kost hosting. Bij een meetup gaat er weleens iets heen aan een zaaltje. Dat is het hele lijstje. Er is geen kantoor, niemand krijgt salaris, en er is geen doelbedrag waar we naartoe werken.</p>',
		},
		{
			type: 'profileCards',
			id: 'supporters',
			colorset: 'dark',
			heading: {
				tagline: 'Supporters',
				value: 'De mensen die meebetalen',
				intro: 'Niemand staat hier zonder het zelf gezegd te hebben. Anoniem is de standaard, niet de uitzondering.',
			},
			// Leeg tot iemand toestemming heeft gegeven; anonymousLabel levert dan de enige kaart. Dat is
			// een complete lijst die toevallig één item heeft, geen lege staat. Komen er namen bij, dan
			// hoort hier ook een intro die zegt dat de volgorde niets betekent — nu is er geen volgorde.
			items: [],
			anonymousLabel: 'Iedereen die anoniem geeft',
		},
	],
};
