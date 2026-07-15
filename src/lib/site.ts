// Central site data for metadata, sitemap, robots and JSON-LD (one source, DRY).
// These are placeholder values — replace name/description/url with your own. The URL comes from the
// validated environment (src/lib/env.ts) so preview and production can differ; its fallback lives there.
import type { SiteStructures } from '@/lib/content';
import { env, isStatic } from '@/lib/env';

export const site = {
	name: 'Dutch Anime Community',
	description: 'De grootste anime community van Nederland en België. Praat mee over anime, games en art, en ga mee naar meetups en conventies.',
	url: env.NEXT_PUBLIC_SITE_URL,
	// BCP-47 language tag for the content. One place that feeds Intl date formatting; the HTML lang
	// (layout.tsx) and OG locale (nl_NL form) mirror it.
	locale: 'nl',
};

// Brand palette for the runtime surfaces that CANNOT read the SCSS tokens in src/styles/_initial.scss:
// next/og (satori renders outside the DOM), the web manifest, and the viewport theme colour. Keep these
// in lockstep with the colour tokens in _initial.scss — that SCSS file is the styling-side mirror of
// the same palette. (SCSS can't be imported into TS, so this one duplication is unavoidable; it lives
// here so every TS/TSX surface reads one source.)
export const brand = {
	primary: '#f5c24a', // --accent (DAC gold)
	warm: '#e7b46b', // amber-tan chrome: browser bar + manifest theme_color (full gold reads too loud there)
	ink: '#241a22', // --background-dark (plum ink)
	page: '#f2ebd7', // --background-light (page canvas)
	subtle: '#d8c9b3', // --color-secondary-dark
	white: '#ffffff', // $white
};

// Route path builders — one source for the URL shape. `absolute()` prefixes the site origin (root
// stays origin-only, no trailing slash) for sitemap entries and JSON-LD.
export const routes = {
	home: '/',
	absolute: (path: string) => `${site.url}${path === '/' ? '' : path}`,
};

// The Storybook build is served differently per environment: a separate dev server on :6006 locally,
// and a static copy under the deploy base path on a static host (.github/workflows/deploy.yml copies
// storybook-static into out/storybook). A single hardcoded URL can't cover both, and the content-data
// layer must stay env-free — so the real URL is derived here, in the env-aware layer.
export const storybookUrl = isStatic ? `${env.NEXT_PUBLIC_BASE_PATH}/storybook` : 'http://localhost:6006';

// The chrome is authored as pure, env-free data (src/content/structures.ts). The Storybook nav item is
// written there with the sentinel URL '/storybook'; this resolver swaps it for the environment-correct
// storybookUrl. Kept here (not in the content loader) so the content layer keeps its purity.
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
