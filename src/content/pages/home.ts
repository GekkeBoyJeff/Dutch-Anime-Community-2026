import type { Page } from '@/lib/site/content';

// De homepage beantwoordt drie vragen in volgorde: wat is dit, gebeurt hier nog iets, en wat kan ik
// nu doen zonder me op te geven. Vandaar dat de agenda direct onder de hero staat en niet onderaan.
// Cijfers zijn beperkt tot wat te onderbouwen is; het ledenaantal staat bewust alleen in de
// stats-balk en niet in de lopende tekst.
export const homePage: Page = {
	meta: {
		title: 'Nederlandstalige anime-community op Discord',
		description:
			'4.500 mensen die in het Nederlands over anime praten: watch parties, game nights, Weerwolven en een eigen stand op Dutch Comic Con en Heroes Made in Asia. Meekijken mag.',
	},
	blocks: [
		{
			type: 'hero',
			id: 'intro',
			colorset: 'dark',
			variant: 'cover',
			tagline: 'Op Discord, in het Nederlands',
			title: 'Hier kennen ze je bij naam!!!',
			value: 'Je komt binnen in een kanaal, niet in een menigte. Je mag eerst een maand alleen meelezen. Dat doet iedereen.',
			media: { type: 'image', src: '/media/spelletjesmiddag.jpg', alt: 'Leden van DAC op een spelletjesmiddag' },
			actions: [
				{ value: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
				{ value: 'Hoe het werkt', variant: 'ghost', url: '/word-lid' },
			],
			// Volgorde is bewust: de stats staan onder de herotekst, dus het eerste wat je na 'Dat doet
			// iedereen' leest moet de drempel verlagen. Het ledenaantal beantwoordt 'leeft dit nog' en
			// blijft staan, maar niet vooraan — 4.500 leest voor een twijfelaar als 'ik ben onzichtbaar'.
			stats: [
				{ count: 'Gratis', label: 'altijd' },
				{ count: '4.500+', label: 'leden' },
				{ count: '4', label: 'cons per jaar' },
				{ count: 'honderden', label: 'regelmatig online' },
			],
			socials: [
				{ value: 'Discord', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
				{ value: 'Instagram', url: 'https://www.instagram.com/dutchanimecommunity/', target: '_blank' },
				{ value: 'TikTok', url: 'https://www.tiktok.com/@dutchanimecommunity', target: '_blank' },
			],
		},
		{
			type: 'eventTeaser',
			id: 'events',
			colorset: 'light',
			heading: {
				tagline: 'Binnenkort',
				title: 'Wat er de komende weken gebeurt',
				intro: 'De agenda staat in Discord. Dit is wat er nu op staat.',
			},
			events: [
				{
					id: 'ev-watchparty',
					title: 'Watch party',
					value: 'Samen kijken, met de chat ernaast. Aanzetten mag, meepraten hoeft niet.',
					location: 'Online · Discord',
					status: 'Elke vrijdag',
					statusVariant: 'success',
					translations: { timeLabel: 'Wanneer', locationLabel: 'Waar' },
				},
				{
					id: 'ev-gamenight',
					title: 'Game night',
					value: 'Meestal Minecraft, soms een toernooitje. Instappen kan halverwege.',
					location: 'Online · Discord',
					status: 'Wekelijks',
					statusVariant: 'success',
					translations: { timeLabel: 'Wanneer', locationLabel: 'Waar' },
				},
				{
					id: 'ev-weerwolven',
					title: 'Weerwolven van Wakkerdam',
					value: 'Ons eigen spel, verspreid over Discord. Instappen kan bij een nieuwe ronde.',
					location: 'Online · Discord',
					status: 'Nieuwe ronde',
					statusVariant: 'info',
					translations: { timeLabel: 'Wanneer', locationLabel: 'Waar' },
				},
				{
					id: 'ev-dcc',
					title: 'Heroes Dutch Comic Con',
					value: 'Onze stand staat er weer. Kom hoi zeggen.',
					startDate: '2026-11-21',
					endDate: '2026-11-22',
					location: 'Jaarbeurs, Utrecht',
					status: 'Met DAC-stand',
					statusVariant: 'success',
					href: 'https://dutchcomiccon.com',
					translations: { timeLabel: 'Wanneer', locationLabel: 'Waar' },
				},
			],
			viewAllUrl: '/evenementen',
			viewAllLabel: 'Alle evenementen',
		},
		{
			type: 'highlightCards',
			id: 'wiifm',
			colorset: 'dark',
			columns: 3,
			heading: {
				tagline: 'Wat het je oplevert',
				title: 'Waarom mensen blijven',
				intro: 'Geen van de drie vraagt dat je meteen iets zegt.',
			},
			items: [
				{
					id: 'wiifm-erbij',
					media: { type: 'image', src: '/media/dcc-2024.png', alt: 'DAC-leden samen bij de stand op Dutch Comic Con' },
					tagline: 'Erbij horen',
					title: 'Je hoort er sneller bij dan je denkt',
					value: 'Niemand kent hier iedereen. Na een maand weet je wel wie er \'s avonds meestal online is.',
				},
				{
					id: 'wiifm-samen',
					media: { type: 'image', src: '/media/dac-meetup.png', alt: 'Groepsfoto op een DAC-meetup' },
					tagline: 'Samen doen',
					title: 'Er is altijd iets samen te doen',
					value: 'Watch parties, game nights, Minecraft. Staat er niks gepland, dan begint er meestal vanzelf iets.',
				},
				{
					id: 'wiifm-laten-zien',
					media: { type: 'image', src: '/media/dcc-2023-highlights.png', alt: 'Cosplay en creatief werk op een con' },
					tagline: 'Laten zien',
					title: 'Je mag jezelf laten zien',
					value: 'Er is een kanaal voor werk dat nog niet af is. Handig, want daar durf je wél iets te posten.',
				},
			],
		},
		{
			type: 'showreel',
			id: 'in-beeld',
			colorset: 'light',
			ratio: '848 / 488',
			heading: {
				tagline: 'In beeld',
				title: 'Dit zijn de mensen',
				intro: 'Gemaakt door leden zelf, op meetups en cons.',
			},
			slides: [
				{ image: '/media/dac-meetup.png', alt: 'Grote groepsfoto op een DAC-meetup', title: 'Meetup met de crew', description: 'De mensen achter de usernames, in het echt.' },
				{ image: '/media/dcc-2024.png', alt: 'DAC-stand op Dutch Comic Con 2024', title: 'Dutch Comic Con 2024', description: 'Onze drukste stand tot nu toe.' },
				{ image: '/media/spelletjesmiddag.jpg', alt: 'Bordspellen op een DAC-spelletjesmiddag', title: 'Spelletjesmiddag', description: 'Bordspellen en veel gelach, in Den Haag.' },
				{ image: '/media/hmia-2024.png', alt: 'DAC-groepsfoto op Heroes Made in Asia', title: 'Heroes Made in Asia', description: 'Twee dagen cosplay en groepsfoto\'s.' },
				{ image: '/media/dcc-2023-highlights.png', alt: 'Hoogtepunten van DAC op Dutch Comic Con 2023', title: 'Dutch Comic Con 2023', description: 'Waar de stand groot werd.' },
			],
		},
		{
			type: 'bentoGrid',
			id: 'binnen-de-server',
			colorset: 'dark',
			columns: 4,
			heading: {
				tagline: 'Binnen de server',
				title: 'Waar het over gaat',
				intro: 'Niet alleen anime. Dat is alleen hoe iedereen hier binnenkwam.',
			},
			items: [
				{ id: 'b-weerwolven', span: 'wide', tagline: 'Ons eigen spel', title: 'Weerwolven van Wakkerdam', value: 'Eén speeldag duurt een echte dag. Je stemt wanneer het jou uitkomt, niet om acht uur \'s avonds.' },
				{ id: 'b-dag', span: 'feature', surface: 'accent', media: { type: 'image', src: '/media/amelia.png', alt: 'Amelia, de mascotte van DAC' }, tagline: 'Buiten anime', title: 'Gewoon je dag delen', value: 'School, werk, en of je huisgenoot te ver ging met de afwas. Niet alleen anime dus.' },
				{ id: 'b-watch', span: 'standard', tagline: 'Samen kijken', title: 'Watch parties', value: 'Samen kijken. Meepraten hoeft niet.' },
				{ id: 'b-game', span: 'standard', tagline: 'Gamen', title: 'Game nights', value: 'Onze eigen server draait al jaren.' },
				{ id: 'b-art', span: 'standard', surface: 'muted', tagline: 'Creatief', title: 'Art en verhalen', value: 'Ook werk dat nog niet af is.' },
				{ id: 'b-cosplay', span: 'standard', tagline: 'Cosplay', title: 'Cosplay', value: 'Naaitips vragen, groepscosplays plannen.' },
				{ id: 'b-media', span: 'standard', surface: 'muted', tagline: 'Luisteren', title: 'Muziek en films', value: 'Playlists delen, filmavonden plannen.' },
				{ id: 'b-cultuur', span: 'standard', tagline: 'Cultuur', title: 'Japan en Korea', value: 'Waarom ontbijt daar soep bevat.' },
			],
		},
		{
			type: 'spotlightQuote',
			id: 'spotlight',
			colorset: 'light',
			quote: 'Ik heb hier een paar van mijn beste vrienden ontmoet. Het heeft me geholpen om mezelf te zijn — en door deze server durf ik nu naar cons te gaan.',
			author: 'Pejowo',
			role: 'lid, review op Disboard',
			mascot: { type: 'image', src: '/media/amelia-smile.webp', alt: '', mode: 'fit', ratio: '1 / 1' },
		},
		{
			type: 'ctaBanner',
			id: 'word-lid',
			colorset: 'dark',
			tone: 'primary',
			align: 'center',
			heading: {
				tagline: 'Klaar?',
				title: 'Kom binnen en kijk eerst rond',
				intro: 'Gratis. Bevalt het niet, dan loop je zo weer naar buiten.',
			},
			primaryCta: { value: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			secondaryCta: { value: 'Wat is Discord?', variant: 'secondary', url: 'https://discord.com/safety/360044149331-What-is-Discord', target: '_blank' },
			media: { type: 'image', src: '/media/amelia-smile.webp', alt: 'Amelia, de mascotte van DAC', mode: 'fit', ratio: '1 / 1' },
		},
	],
};
