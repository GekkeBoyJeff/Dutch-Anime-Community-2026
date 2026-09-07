import { env, isStatic } from '@/lib/shared/env';
import type { SiteStructures } from '@/lib/site/content';

export const site = {
	name: 'Dutch Anime Community',
	description: 'De grootste anime community van Nederland en België. Praat mee over anime, games en art, en ga mee naar meetups en conventies.',
	url: env.NEXT_PUBLIC_SITE_URL,
};

// The colour tokens from src/styles/theme.scss, duplicated for the runtime
// surfaces that cannot read SCSS: next/og, the web manifest and the viewport theme colour.
// Keep both sides in lockstep.
export const brand = {
	primary: '#f5c24a', // --primary
	warm: '#e7b46b', // browser bar + manifest theme_color; full gold reads too loud there
	ink: '#241a22', // --background-dark
	page: '#f2ebd7', // --page
	subtle: '#d8c9b3', // --color-secondary-dark
};

export const routes = {
	home: '/',
	absolute: (path: string) => `${site.url}${path === '/' ? '' : path}`,
};

export const storybookUrl = isStatic ? `${env.NEXT_PUBLIC_BASE_PATH}/storybook` : 'http://localhost:6006';

// The chrome is authored as env-free data (src/content/structures.ts), where the Storybook nav item
// carries '/storybook' as a sentinel; this resolver is what turns it into a real URL.
export const resolveChrome = (structures: SiteStructures): SiteStructures => {
	return {
		...structures,
		navigation: {
			...structures.navigation,
			items: structures.navigation.items?.map((item) =>
				item.url === '/storybook' ? { ...item, url: storybookUrl } : item,
			),
		},
	};
}
