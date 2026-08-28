import type { Page } from '@/lib/site/content';

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
			heading: {
				tagline: 'Over ons',
				title: 'Wie hier rondlopen',
				intro: 'Anime-fans, gamers, artists en cosplayers uit Nederland en Vlaanderen.',
			},
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
				title: 'Niet alleen anime',
				intro: 'Anime is hoe iedereen hier binnenkwam. Daarna gaat het over van alles.',
			},
			items: [
				{ id: 'p-anime', span: 'feature', media: { type: 'image', src: '/media/dcc-2023-highlights.png', alt: 'Cosplay en anime-activiteiten op een con' }, tagline: 'De kern', title: 'Anime en manga', value: 'Seizoenspremières, oude parels, en wat jij nu kijkt. Iemand heeft het altijd al gezien.' },
				{ id: 'p-dag', span: 'wide', surface: 'accent', tagline: 'En verder', title: 'Gewoon je dag delen', value: 'School, werk, en of je huisgenoot te ver ging met de afwas. Ook dat hoort erbij.' },
				{ id: 'p-gamen', span: 'standard', tagline: 'Gamen', title: 'Games en Minecraft', value: 'Onze eigen server. Cozy bouwen of fanatiek potjes.' },
				{ id: 'p-cosplay', span: 'standard', tagline: 'Cosplay', title: 'Cosplay', value: 'Wie naait er mee aan een groepscosplay voor maart?' },
				{ id: 'p-art', span: 'standard', surface: 'muted', tagline: 'Creatief', title: 'Art en verhalen', value: 'Tekeningen, edits, fanfiction. Feedback is eerlijk en aardig.' },
				{ id: 'p-muziek', span: 'standard', tagline: 'Luisteren', title: 'Muziek en films', value: 'Playlists die je nergens anders gedeeld krijgt.' },
				{ id: 'p-cultuur', span: 'standard', surface: 'muted', tagline: 'Cultuur', title: 'Japan en Korea', value: 'Wie er geweest is, vertelt hoe het echt was.' },
				{ id: 'p-watch', span: 'standard', tagline: 'Elke week', title: 'Watch parties', value: 'Elke week samen kijken.' },
			],
		},
		{
			type: 'statBand',
			id: 'cijfers',
			colorset: 'light',
			heading: {
				tagline: 'In cijfers',
				title: 'DAC in het kort',
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
				title: 'Weerwolven van Wakkerdam',
				intro: 'Gehost door Hugo, al jaren.',
			},
			value: 'Async gespeeld over Discord: één speeldag duurt een hele echte dag. Je speelt dus mee wanneer het jou uitkomt, tussen colleges door of \'s avonds op de bank. Rollen, allianties, dagelijkse stemrondes, en heel veel plottwists. Geen ervaring nodig; meedoen is de beste manier om het te leren.',
		},
		{
			type: 'profileCards',
			id: 'team',
			colorset: 'light',
			columns: 4,
			heading: {
				tagline: 'Vrijwilligers',
				title: 'Wie DAC draaiende houdt',
				intro: 'Een klein team vrijwilligers. Geen bedrijf, gewoon fans die het leuk vinden om dit voor elkaar te regelen.',
			},
			items: [
				{ id: 't-hugo', name: 'Hugo', role: 'Oprichter', value: 'Begon de server in 2019 en host Weerwolven van Wakkerdam.' },
				{ id: 't-ademen', name: 'Ademen', role: 'Staff en social', value: 'Houdt de boel netjes en runt Instagram, TikTok en X.' },
				{ id: 't-event', name: 'Het eventteam', role: 'Online events', value: 'Regelt wat er elke week online gebeurt.' },
				{ id: 't-stand', name: 'Het standteam', role: 'Op de cons', value: 'Zet de stand neer op de cons en draait daar de anime-quiz.' },
			],
		},
		{
			type: 'introGrid',
			id: 'meedoen',
			colorset: 'dark',
			heading: {
				tagline: 'Zelf meedoen',
				title: 'Iets komen brengen?',
				intro: 'Niet iedereen komt hier iets halen. Sommigen willen juist iets bijdragen.',
			},
			panels: [
				{
					id: 'm-laten-zien',
					title: 'Laten zien',
					subtitle: 'Voor iedereen die iets maakt. Er zijn aparte kanalen voor, ook voor dingen die half klaar zijn.',
					action: { label: 'Creatieve kanalen', href: 'https://discord.gg/dutchanimecommunity' },
				},
				{
					id: 'm-meehelpen',
					title: 'Meehelpen',
					subtitle: 'Het eventteam en het standteam kunnen versterking gebruiken. Een paar avonden per maand is al genoeg.',
					action: { label: 'Vrijwilligerskanaal', href: 'https://discord.gg/dutchanimecommunity' },
				},
				{
					id: 'm-steunen',
					title: 'Steunen',
					subtitle: 'De stand, het drukwerk en de Minecraft-server kosten geld. Dat betalen leden zelf.',
					action: { label: 'Supporters', href: '/supporters' },
				},
			],
		},
		{
			type: 'ctaBanner',
			id: 'word-lid',
			colorset: 'dark',
			tone: 'primary',
			align: 'center',
			heading: {
				tagline: 'Klinkt goed?',
				title: 'Kom een keer kijken',
				intro: 'Binnenlopen is gratis en je zit nergens aan vast.',
			},
			primaryCta: { value: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			secondaryCta: { value: 'Alle evenementen', variant: 'secondary', url: '/evenementen' },
			media: { type: 'image', src: '/media/amelia-smile.webp', alt: 'Amelia, de mascotte van DAC', mode: 'fit', ratio: '1 / 1' },
		},
	],
};
