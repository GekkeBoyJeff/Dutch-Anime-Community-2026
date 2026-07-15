import type { Page } from '@/lib/content';

// De community-pagina: wat er binnen de server gebeurt en wie het draaiende houdt. Dit is de
// "gezellig"-pagina — sfeer voelen, mensen zien, en snappen dat je er zo tussen past.
export const communityPage: Page = {
	meta: {
		title: 'Community',
		description: 'Anime-fans, gamers, artists en cosplayers uit Nederland en Vlaanderen. Ontdek wat er binnen DAC gebeurt — van watch parties tot Weerwolven van Wakkerdam.',
	},
	blocks: [
		{
			type: 'ctaBanner',
			id: 'header',
			colorset: 'dark',
			tagline: 'Over ons',
			headline: 'Zó gezellig is DAC',
			subline: 'Anime-fans, gamers, artists en cosplayers uit heel Nederland en Vlaanderen. Van alle leeftijden, iedereen welkom.',
			media: { type: 'image', src: '/media/dac-meetup.png', alt: 'DAC-leden samen op een meetup' },
		},
		{
			type: 'growingMediaOnScroll',
			id: 'sfeer',
			colorset: 'light',
			media: { type: 'image', src: '/media/dac-meetup.png', alt: 'Grote groepsfoto op een DAC-meetup' },
			caption: 'DAC-meetup — de mensen achter de usernames, gewoon in het echt.',
		},
		{
			type: 'bentoGrid',
			id: 'pijlers',
			colorset: 'light',
			heading: {
				tagline: 'Wat er binnen gebeurt',
				value: 'Waar we het over hebben',
				intro: 'Voor elk onderwerp een eigen hoek — en je kiest zelf welke kanalen je ziet.',
			},
			columns: 4,
			items: [
				{ id: 'p-anime', span: 'feature', media: { type: 'image', src: '/media/dcc-2023-highlights.png', alt: 'Cosplay en anime-activiteiten op een con' }, tagline: 'De kern', title: 'Anime & manga', body: 'Van seizoenspremières tot verborgen parels — deel wat je kijkt en leest en vind je volgende favoriet.' },
				{ id: 'p-gamen', span: 'standard', surface: 'accent', tagline: 'Gamen', title: 'Games & Minecraft', body: 'Onze eigen Minecraft-server plus game nights: van cozy builds tot fanatieke potjes.' },
				{ id: 'p-cosplay', span: 'standard', tagline: 'Cosplay', title: 'Cosplay', body: 'Laat je work-in-progress zien, vraag tips en plan groepscosplays voor de con.' },
				{ id: 'p-art', span: 'standard', surface: 'muted', tagline: 'Creatief', title: 'Art & verhalen', body: 'Een grote creatieve hoek voor je tekeningen, edits en fanfiction — met eerlijke, aardige feedback.' },
				{ id: 'p-muziek', span: 'standard', tagline: 'Luisteren & kijken', title: 'Muziek & films', body: 'J-pop, K-pop, soundtracks en filmavonden: deel je playlists en kijk mee.' },
				{ id: 'p-cultuur', span: 'standard', surface: 'accent', tagline: 'Cultuur', title: 'Japan & Korea', body: 'Taal, eten, reizen en tradities — nieuwsgierig? Hier leer je het van elkaar.' },
				{ id: 'p-samen', span: 'wide', surface: 'inverse', tagline: 'Elke week', title: 'Watch parties & game nights', body: 'Elke week samen kijken en gamen. Er is altijd wel iemand online.' },
				{ id: 'p-leven', span: 'standard', surface: 'muted', tagline: 'En verder', title: 'Gewoon je dag delen', body: 'Niet alleen anime: hier praat je ook over school, werk en het leven.' },
			],
		},
		{
			type: 'titleText',
			id: 'weerwolven',
			colorset: 'dark',
			heading: {
				tagline: 'Ons eigen spel',
				value: 'Weerwolven van Wakkerdam',
				intro: 'Het spel waar nieuwe leden binnen een week aan verslaafd zijn.',
			},
			text: 'Ons signatuur-spel, gehost door Hugo. Het wordt async gespeeld over Discord: één spel-dag duurt een hele echte dag, dus je speelt gewoon mee wanneer het jou uitkomt — tussen colleges door of \'s avonds op de bank. Rollen, allianties, dagelijkse stemrondes en heel veel plottwists. Geen ervaring nodig; meedoen is de beste manier om het te leren.',
			align: 'center',
			actions: [{ label: 'Speel mee via Discord', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' }],
		},
		{
			type: 'statBand',
			id: 'cijfers',
			colorset: 'light',
			heading: {
				tagline: 'In cijfers',
				value: 'DAC blijft groeien',
			},
			items: [
				{ id: 'c-leden', value: 4500, suffix: '+', label: 'leden' },
				{ id: 'c-online', value: 1000, suffix: '+', label: 'tegelijk online' },
				{ id: 'c-cons', value: 4, label: 'cons per jaar' },
				{ id: 'c-jaren', value: 7, label: 'jaar samen — sinds 2019' },
			],
		},
		{
			type: 'featureCards',
			id: 'team',
			colorset: 'light',
			title: 'Wie DAC draaiende houdt',
			intro: 'Een klein team vrijwilligers — geen bedrijf, gewoon fans die het leuk vinden om dit voor elkaar te regelen.',
			items: [
				{ id: 't-hugo', title: 'Hugo — oprichter', body: 'Startte de server in 2019 en host ons signatuur-spel Weerwolven van Wakkerdam.' },
				{ id: 't-ademen', title: 'Ademen — staff & social', body: 'Houdt de boel netjes en gezellig, en runt onze kanalen op Instagram, TikTok en X.' },
				{ id: 't-event', title: 'Het eventteam', body: 'Regelt de online events: watch parties, game nights en de spelletjesmiddagen.' },
				{ id: 't-stand', title: 'Het standteam', body: 'Runt onze stands op de cons — van de zwarte banner tot de anime-quiz en de groepsfoto\'s.' },
			],
		},
		{
			type: 'ctaBanner',
			id: 'word-lid',
			colorset: 'dark',
			tagline: 'Klinkt goed?',
			headline: 'Kom een kijkje nemen',
			subline: 'Binnenlopen is gratis en je zit nergens aan vast. Zeg hoi, kijk rond, en blijf als het klikt.',
			primaryCta: { label: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			secondaryCta: { label: 'Bekijk de events', variant: 'secondary', url: '/evenementen' },
			tone: 'primary',
			align: 'center',
			media: { type: 'image', src: '/media/amelia-smile.webp', alt: 'Amelia, de DAC-mascotte, kijkt vrolijk over de rand', mode: 'fit', ratio: '1 / 1' },
		},
	],
};
