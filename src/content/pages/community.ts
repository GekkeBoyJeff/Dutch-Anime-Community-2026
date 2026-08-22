import type { Page } from '@/lib/content';

// De community-pagina beantwoordt waar het hier over gaat buiten anime, wie het draaiende houdt, en
// wat er alleen hier bestaat. Het blok "zelf meedoen" onderaan bedient bezoekers die iets komen
// brengen in plaats van halen — voor hen is Word lid een antwoord op de verkeerde vraag.
export const communityPage: Page = {
	meta: {
		title: 'Community',
		description:
			'Anime-fans, gamers, artists en cosplayers uit Nederland en Vlaanderen. Waar we het over hebben, wie het draaiende houdt, en hoe je zelf kunt meehelpen.',
	},
	blocks: [
		{
			type: 'ctaBanner',
			id: 'header',
			colorset: 'dark',
			tagline: 'Over ons',
			headline: 'Wie hier rondlopen',
			subline: 'Anime-fans, gamers, artists en cosplayers uit Nederland en Vlaanderen.',
			media: { type: 'image', src: '/media/dac-meetup.png', alt: 'DAC-leden samen op een meetup' },
		},
		{
			type: 'growingMediaOnScroll',
			id: 'sfeer',
			colorset: 'light',
			media: { type: 'image', src: '/media/dac-meetup.png', alt: 'Grote groepsfoto op een DAC-meetup' },
			caption: 'Meetup met de crew. Zo gewoon ziet het eruit.',
		},
		{
			type: 'bentoGrid',
			id: 'pijlers',
			colorset: 'dark',
			columns: 4,
			heading: {
				tagline: 'Waar we het over hebben',
				value: 'Niet alleen anime',
				intro: 'Anime is hoe iedereen hier binnenkwam. Daarna gaat het over van alles.',
			},
			items: [
				{ id: 'p-anime', span: 'feature', media: { type: 'image', src: '/media/dcc-2023-highlights.png', alt: 'Cosplay en anime-activiteiten op een con' }, tagline: 'De kern', title: 'Anime en manga', body: 'Seizoenspremières, oude parels, en wat jij nu kijkt. Iemand heeft het altijd al gezien.' },
				{ id: 'p-dag', span: 'wide', surface: 'accent', tagline: 'En verder', title: 'Gewoon je dag delen', body: 'School, werk, en of je huisgenoot te ver ging met de afwas. Ook dat hoort erbij.' },
				{ id: 'p-gamen', span: 'standard', tagline: 'Gamen', title: 'Games en Minecraft', body: 'Onze eigen server. Cozy bouwen of fanatiek potjes.' },
				{ id: 'p-cosplay', span: 'standard', tagline: 'Cosplay', title: 'Cosplay', body: 'Wie naait er mee aan een groepscosplay voor maart?' },
				{ id: 'p-art', span: 'standard', surface: 'muted', tagline: 'Creatief', title: 'Art en verhalen', body: 'Tekeningen, edits, fanfiction. Feedback is eerlijk en aardig.' },
				{ id: 'p-muziek', span: 'standard', tagline: 'Luisteren', title: 'Muziek en films', body: 'Playlists die je nergens anders gedeeld krijgt.' },
				{ id: 'p-cultuur', span: 'standard', surface: 'muted', tagline: 'Cultuur', title: 'Japan en Korea', body: 'Wie er geweest is, vertelt hoe het echt was.' },
				{ id: 'p-watch', span: 'standard', tagline: 'Elke week', title: 'Watch parties', body: 'Elke week samen kijken.' },
			],
		},
		{
			type: 'statBand',
			id: 'cijfers',
			colorset: 'light',
			heading: {
				tagline: 'In cijfers',
				value: 'DAC in het kort',
			},
			items: [
				{ id: 'c-jaren', value: 7, label: 'jaar samen, sinds 2019' },
				{ id: 'c-leden', value: 4500, suffix: '+', label: 'leden' },
				{ id: 'c-cons', value: 4, label: 'cons per jaar' },
			],
		},
		{
			type: 'titleText',
			id: 'weerwolven',
			colorset: 'dark',
			align: 'center',
			heading: {
				tagline: 'Ons eigen spel',
				value: 'Weerwolven van Wakkerdam',
				intro: 'Gehost door Hugo, al jaren.',
			},
			text: 'Async gespeeld over Discord: één speeldag duurt een hele echte dag. Je speelt dus mee wanneer het jou uitkomt, tussen colleges door of \'s avonds op de bank. Rollen, allianties, dagelijkse stemrondes, en heel veel plottwists. Geen ervaring nodig; meedoen is de beste manier om het te leren.',
		},
		{
			type: 'profileCards',
			id: 'team',
			colorset: 'light',
			columns: 4,
			heading: {
				tagline: 'Vrijwilligers',
				value: 'Wie DAC draaiende houdt',
				intro: 'Een klein team vrijwilligers. Geen bedrijf, gewoon fans die het leuk vinden om dit voor elkaar te regelen.',
			},
			items: [
				{ id: 't-hugo', name: 'Hugo', role: 'Oprichter', text: 'Begon de server in 2019 en host Weerwolven van Wakkerdam.' },
				{ id: 't-ademen', name: 'Ademen', role: 'Staff en social', text: 'Houdt de boel netjes en runt Instagram, TikTok en X.' },
				{ id: 't-event', name: 'Het eventteam', role: 'Online events', text: 'Regelt wat er elke week online gebeurt.' },
				{ id: 't-stand', name: 'Het standteam', role: 'Op de cons', text: 'Zet de stand neer op de cons en draait daar de anime-quiz.' },
			],
		},
		{
			type: 'introGrid',
			id: 'meedoen',
			colorset: 'dark',
			heading: {
				tagline: 'Zelf meedoen',
				value: 'Iets komen brengen?',
				intro: 'Niet iedereen komt hier iets halen. Sommigen willen juist iets bijdragen.',
			},
			panels: [
				{
					id: 'm-laten-zien',
					title: 'Laten zien',
					subtitle: 'Voor iedereen die iets maakt. Er zijn aparte kanalen voor, ook voor dingen die half klaar zijn.',
					action: { label: 'Creatieve kanalen', url: 'https://discord.gg/dutchanimecommunity' },
				},
				{
					id: 'm-meehelpen',
					title: 'Meehelpen',
					subtitle: 'Het eventteam en het standteam kunnen versterking gebruiken. Een paar avonden per maand is al genoeg.',
					action: { label: 'Vrijwilligerskanaal', url: 'https://discord.gg/dutchanimecommunity' },
				},
				{
					id: 'm-steunen',
					title: 'Steunen',
					subtitle: 'De stand, het drukwerk en de Minecraft-server kosten geld. Dat betalen leden zelf.',
					action: { label: 'Supporters', url: '/supporters' },
				},
			],
		},
		{
			type: 'ctaBanner',
			id: 'word-lid',
			colorset: 'dark',
			tone: 'primary',
			align: 'center',
			tagline: 'Klinkt goed?',
			headline: 'Kom een keer kijken',
			subline: 'Binnenlopen is gratis en je zit nergens aan vast.',
			primaryCta: { label: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			secondaryCta: { label: 'Alle evenementen', variant: 'secondary', url: '/evenementen' },
			media: { type: 'image', src: '/media/amelia-smile.webp', alt: 'Amelia, de mascotte van DAC', mode: 'fit', ratio: '1 / 1' },
		},
	],
};
