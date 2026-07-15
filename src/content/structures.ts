import type { NavItem, SiteStructures } from '@/lib/content';

// Primary navigation. All pages are registered in src/content/pages/index.ts; the 'Word lid' CTA
// goes straight to the Discord invite — the one conversion goal of the whole site.
const navItems: NavItem[] = [
	{ label: 'Home', url: '/', icon: 'home' },
	{ label: 'Community', url: '/community', icon: 'heart' },
	{ label: 'Evenementen', url: '/evenementen', icon: 'calendar' },
];

// Pure data for the site-wide chrome. Edit by hand or export a new version from the visual
// builder (/builder) — see the README's "Visual builder" section.
// The brand title is deliberately NOT sourced from site.ts: content files stay pure data (the
// future CMS seam), and site.ts pulls in the validated env — a dependency this layer must not have.
export const structures: SiteStructures = {
	navigation: {
		brand: { title: 'Dutch Anime Community', src: '/media/dac-logo.png' },
		items: navItems,
		cta: { label: 'Word lid', url: 'https://discord.gg/dutchanimecommunity', variant: 'primary' },
	},
	footer: {
		brand: { title: 'Dutch Anime Community', tagline: 'De gezelligste anime-community van Nederland en België.' },
		navColumns: [
			{
				heading: 'Community',
				links: [
					{ label: 'Wat we doen', url: '/community' },
					{ label: 'Evenementen', url: '/evenementen' },
					{ label: 'Word lid', url: '/word-lid' },
				],
			},
			{
				heading: 'Ontdek',
				links: [
					{ label: 'Home', url: '/' },
					{ label: 'Join de Discord', url: 'https://discord.gg/dutchanimecommunity' },
				],
			},
		],
		socialLinks: [
			{ label: 'Discord', url: 'https://discord.gg/dutchanimecommunity' },
			{ label: 'Instagram', url: 'https://www.instagram.com/dutchanimecommunity/' },
			{ label: 'TikTok', url: 'https://www.tiktok.com/@dutchanimecommunity' },
			{ label: 'X', url: 'https://x.com/DutchAnimeC' },
		],
		credit: 'Gemaakt door de DAC-community',
	},
	// Site-wide overlays, mounted once in (website)/layout.tsx (kept out of SiteChrome so the builder
	// canvas stays clean). Each is optional data — remove the key to switch the overlay off.
	scrollProgress: {
		position: 'top',
		color: 'primary',
	},
	searchPalette: {
		placeholder: 'Zoek een pagina… (⌘K)',
		categories: ['Pagina\'s', 'Meedoen'],
		items: [
			{ id: 'sp-home', label: 'Home', hint: '/', category: 'Pagina\'s', url: '/' },
			{ id: 'sp-community', label: 'Community', hint: '/community', category: 'Pagina\'s', url: '/community' },
			{ id: 'sp-events', label: 'Evenementen', hint: '/evenementen', category: 'Pagina\'s', url: '/evenementen' },
			{ id: 'sp-join', label: 'Word lid', hint: '/word-lid', category: 'Meedoen', url: '/word-lid' },
			{ id: 'sp-discord', label: 'Join de Discord', hint: 'discord.gg', category: 'Meedoen', url: 'https://discord.gg/dutchanimecommunity' },
		],
	},
	cookieConsent: {
		title: 'Wij gebruiken cookies',
		description: 'We gebruiken cookies om de site goed te laten werken en te snappen hoe hij gebruikt wordt. Jij kiest wat je toestaat.',
		categories: [
			{ id: 'analytics', label: 'Statistieken', description: 'Anonieme gebruiksstatistieken om de site te verbeteren.' },
			{ id: 'marketing', label: 'Marketing', description: 'Voor het personaliseren en meten van campagnes.' },
		],
	},
};
