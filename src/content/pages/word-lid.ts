import type { Page } from '@/lib/content';

// De word-lid-pagina: twijfels wegnemen en de eerste vijf minuten glashelder maken. Kort,
// concreet en met maar één actie: de Discord-invite.
export const wordLidPage: Page = {
	meta: {
		title: 'Word lid',
		description: 'In één minuut lid van de gezelligste anime-community van Nederland. Gratis, zonder gedoe, voor alle leeftijden.',
	},
	blocks: [
		{
			type: 'hero',
			id: 'intro',
			colorset: 'dark',
			tagline: 'Twijfel je nog?',
			title: 'In één minuut binnen, gratis',
			text: 'Geen account-gedoe, geen verplichtingen. Eén klik en je zit erbij — en als het niks voor je is, loop je net zo makkelijk weer naar buiten.',
			media: { type: 'image', src: '/media/dac-meetup.png', alt: 'DAC-leden samen op een meetup' },
			actions: [
				{ label: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			],
			stats: [
				{ count: '4.500+', label: 'leden' },
				{ count: 'Gratis', label: 'altijd' },
				{ count: 'Alle', label: 'leeftijden' },
			],
		},
		{
			type: 'steps',
			id: 'zo-werkt-het',
			colorset: 'light',
			variant: 'process',
			heading: {
				tagline: 'Zo makkelijk is het',
				value: 'In drie stappen erbij',
				intro: 'Binnen vijf minuten zit je middenin het gesprek.',
			},
			items: [
				{ id: 'stap-1', title: 'Join de Discord', body: 'Eén klik op Word lid en je bent binnen. Gratis, zonder gedoe.' },
				{ id: 'stap-2', title: 'Kies je rollen', body: 'Vink aan wat jij leuk vindt — anime, gamen, art — en je ziet precies de kanalen die bij je passen.' },
				{ id: 'stap-3', title: 'Zeg hoi', body: 'Stel jezelf voor in het welkomstkanaal. Grote kans dat je binnen een uur je eerste gesprek te pakken hebt.' },
			],
		},
		{
			type: 'faqAccordion',
			id: 'faq',
			colorset: 'dark',
			singleOpen: true,
			heading: {
				tagline: 'Nog vragen?',
				value: 'Even eerlijk antwoord',
				intro: 'De vragen die nieuwe leden het vaakst stellen.',
			},
			items: [
				{ id: 'faq-gratis', question: 'Is het gratis?', answer: 'Ja, helemaal. Word lid en je kunt meteen overal aan meedoen.' },
				{ id: 'faq-kennis', question: 'Moet ik veel van anime weten of goed kunnen tekenen?', answer: 'Nee joh. Beginners zijn net zo welkom als veteranen — kom gewoon binnen en doe mee met wat jou leuk lijkt.' },
				{ id: 'faq-leeftijd', question: 'Is er een leeftijdsgrens?', answer: 'DAC is voor alle leeftijden — geen 18+-server. De meeste leden zijn ergens tussen de 16 en 36.' },
				{ id: 'faq-discord', question: 'Wat is Discord eigenlijk?', answer: 'Een gratis chat-app voor communities: tekst, spraak en video. Werkt gewoon in je browser of als app op je telefoon. <a href="https://discord.com/safety/360044149331-What-is-Discord" target="_blank" rel="noopener">Lees hier hoe Discord werkt</a>.' },
				{ id: 'faq-taal', question: 'Is alles in het Nederlands?', answer: 'Ja, de voertaal is Nederlands — en Vlaams hoort daar net zo goed bij. Leden komen uit heel Nederland en België.' },
				{ id: 'faq-doen', question: 'Wat kan ik er allemaal doen?', answer: 'Kletsen over anime en manga, samen kijken en gamen, je art delen, meedoen met Weerwolven van Wakkerdam, en ons in het echt ontmoeten op meetups en cons.' },
			],
		},
		{
			type: 'reviews',
			id: 'reviews',
			colorset: 'light',
			title: 'Leden over DAC',
			intro: 'Echte reviews van leden, zoals ze op Disboard staan.',
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
			tagline: 'Oké, laatste vraag',
			headline: 'Tot zo op Discord?',
			subline: 'Amelia houdt een plekje voor je vrij.',
			primaryCta: { label: 'Word lid', variant: 'primary', url: 'https://discord.gg/dutchanimecommunity', target: '_blank' },
			tone: 'primary',
			align: 'center',
			media: { type: 'image', src: '/media/amelia-smile.webp', alt: 'Amelia, de DAC-mascotte, kijkt vrolijk over de rand', mode: 'fit', ratio: '1 / 1' },
		},
	],
};
