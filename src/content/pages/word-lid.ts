import type { Page } from '@/lib/content';

// De word-lid-pagina neemt twijfel weg in plaats van te overtuigen. Vandaar dat het bezwarenblok
// zichtbare tegels zijn en geen accordeon: geruststelling die je moet openklikken, werkt niet. De
// derde stap is bewust "kijk eerst even rond" — meelezen is wat de meeste mensen de eerste weken
// doen, en de site hoort daar geen tekortkoming van te maken.
export const wordLidPage: Page = {
	meta: {
		title: 'Word lid',
		description:
			'In één minuut binnen, gratis, zonder apart account. Alle leeftijden, en je mag eerst een tijdje alleen meelezen.',
	},
	blocks: [
		{
			type: 'hero',
			id: 'intro',
			colorset: 'dark',
			variant: 'panel',
			tagline: 'Twijfel je nog?',
			title: 'In één minuut binnen, gratis',
			text: 'Geen apart account, geen verplichtingen. Je klikt, je bent binnen. Rondkijken mag zo lang je wilt.',
			media: { type: 'image', src: '/media/dac-meetup.png', alt: 'DAC-leden samen op een meetup' },
			actions: [{ label: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' }],
			stats: [
				{ count: 'Gratis', label: 'altijd' },
				{ count: 'Alle', label: 'leeftijden' },
				{ count: 'Geen', label: 'account nodig' },
			],
		},
		{
			type: 'steps',
			id: 'zo-werkt-het',
			colorset: 'light',
			variant: 'process',
			heading: {
				tagline: 'De eerste vijf minuten',
				value: 'Zo gaat het',
				intro: 'Drie stappen, en bij de derde hoef je nog steeds niets te zeggen.',
			},
			items: [
				{ id: 'stap-1', title: 'Join de Discord', body: 'Eén klik op Word lid. Heb je Discord al, dan ben je meteen binnen.' },
				{ id: 'stap-2', title: 'Kies je rollen', body: 'Vink aan wat je leuk vindt. Je ziet daarna alleen de kanalen die daarbij passen.' },
				{ id: 'stap-3', title: 'Kijk eerst even rond', body: 'Lees mee zo lang je wilt. Meestal zegt iemand vanzelf een keer hoi tegen jou.' },
			],
		},
		{
			type: 'bentoGrid',
			id: 'wat-er-niet-is',
			colorset: 'dark',
			columns: 4,
			heading: {
				tagline: 'Even eerlijk',
				value: 'Wat er niet gebeurt',
				intro: 'Zeven dingen die je niet hoeft.',
			},
			items: [
				{ id: 'n-weg', span: 'wide', title: 'Je kunt zo weer weg', body: 'Bevalt het niet, dan loop je net zo makkelijk weer naar buiten.' },
				{ id: 'n-account', span: 'standard', title: 'Geen apart account', body: 'Je Discord-account is genoeg.' },
				{ id: 'n-gratis', span: 'standard', surface: 'accent', title: 'Gratis', body: 'Altijd. Er is geen betaalde versie.' },
				{ id: 'n-leeftijd', span: 'standard', title: 'Alle leeftijden', body: 'Geen 18+-server.' },
				{ id: 'n-weten', span: 'standard', surface: 'muted', title: 'Je hoeft niks te weten', body: 'Ook niet van anime. Beginnen mag.' },
				{ id: 'n-cosplay', span: 'standard', title: 'Je hoeft niet te cosplayen', body: 'Cosplay is één kanaal, geen toegangseis.' },
				{ id: 'n-posten', span: 'standard', surface: 'muted', title: 'Je hoeft niks te posten', body: 'Meelezen is genoeg.' },
			],
		},
		{
			type: 'stickyShowcase',
			id: 'journey',
			colorset: 'light',
			heading: {
				tagline: 'Zo groeit het',
				value: 'En dan?',
				intro: 'Niemand begint vooraan. Dit is hoe het meestal gaat.',
			},
			steps: [
				{ id: 'j-meelezen', title: 'Je leest een tijdje mee', body: 'De eerste weken lees je vooral. Dat is ook meedoen; bijna iedereen begint zo.', media: { type: 'image', src: '/media/amelia-hug.webp', alt: 'Amelia, de DAC-mascotte, verwelkomt je' } },
				{ id: 'j-watchparty', title: 'Je haakt aan bij een watch party', body: 'Aanzetten en kijken. Reageren in de chat mag, hoeft niet.', media: { type: 'image', src: '/media/spelletjesmiddag.jpg', alt: 'Leden van DAC tijdens een spelletjesmiddag' } },
				{ id: 'j-meetup', title: 'Je gaat mee naar een meetup', body: 'De mensen achter de usernames blijken in het echt net zo gewoon.', media: { type: 'image', src: '/media/dac-meetup.png', alt: 'Groepsfoto op een DAC-meetup' } },
				{ id: 'j-con', title: 'Je staat samen op de con', body: 'Met een groep naar Dutch Comic Con, inclusief de traditionele groepsfoto.', media: { type: 'image', src: '/media/dac-stand.jpg', alt: 'De DAC-stand op een conventie' } },
			],
		},
		{
			type: 'textMedia',
			id: 'veiligheid',
			colorset: 'dark',
			reverse: true,
			title: 'Er wordt op gelet',
			text: 'Er is een vast team dat meekijkt: staff en moderators die zelf ook gewoon lid zijn. De regels zijn kort. Doe normaal tegen elkaar, geen haat, geen 18+. Wie zich er niet aan houdt krijgt een waarschuwing, en bij herhaling gaat hij eruit. Dat wordt bijgehouden, dus het blijft niet bij praten. Zit je ergens mee, ook als je twijfelt of het wel erg genoeg is, stuur dan een mod een bericht. Daar hoef je geen reden voor te hebben.',
			media: { type: 'image', src: '/media/dac-meetup.png', alt: 'DAC-leden van verschillende leeftijden samen op een meetup' },
		},
		{
			type: 'faqAccordion',
			id: 'faq',
			colorset: 'light',
			singleOpen: true,
			heading: {
				tagline: 'Nog vragen?',
				value: 'Even kort antwoord',
			},
			items: [
				{ id: 'faq-discord', question: 'Wat is Discord eigenlijk?', answer: 'Een gratis chat-app voor groepen: tekst, spraak en video. Werkt in je browser of als app. <a href="https://discord.com/safety/360044149331-What-is-Discord" target="_blank" rel="noopener">Zo werkt Discord</a>.' },
				{ id: 'faq-taal', question: 'Is alles in het Nederlands?', answer: 'Ja. Vlaams hoort daar net zo goed bij; leden komen uit heel Nederland en Vlaanderen.' },
				{ id: 'faq-leeftijd', question: 'Hoe oud is iedereen daar?', answer: 'Er zitten scholieren tussen en mensen met een baan.' },
				{ id: 'faq-doen', question: 'Wat kan ik er allemaal doen?', answer: 'Kletsen over anime en manga, samen kijken en gamen, je art delen, meedoen met Weerwolven, en ons in het echt tegenkomen op meetups en cons.' },
			],
		},
		{
			type: 'reviews',
			id: 'reviews',
			colorset: 'dark',
			title: 'Wat leden zeggen',
			intro: 'Drie reviews van Disboard, ongewijzigd overgenomen.',
			subject: 'Dutch Anime Community',
			items: [
				{ id: 'r-rik', author: 'Rik', rating: 5, body: 'Leuke server die enorm gezellig is! Genoeg mensen om mee te praten en mensen te leren kennen die dezelfde series als jij kijken.' },
				{ id: 'r-pejowo', author: 'Pejowo', rating: 5, body: 'Ik heb hier een paar van mijn beste vrienden ontmoet. Het heeft me geholpen om mezelf te zijn — en door deze server durf ik nu naar cons te gaan.' },
				{ id: 'r-fientje', author: 'Fientje', rating: 5, body: 'Er zitten enorm veel gezellige mensen in. Het is bijna altijd leuk in de chat en je maakt er gemakkelijk vrienden!' },
			],
		},
		{
			type: 'ctaBanner',
			id: 'word-lid',
			colorset: 'dark',
			tone: 'primary',
			align: 'center',
			tagline: 'Oké, laatste vraag',
			headline: 'Tot zo op Discord?',
			subline: 'Amelia houdt een plekje voor je vrij.',
			primaryCta: { label: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			media: { type: 'image', src: '/media/amelia-smile.webp', alt: 'Amelia, de mascotte van DAC', mode: 'fit', ratio: '1 / 1' },
		},
	],
};
