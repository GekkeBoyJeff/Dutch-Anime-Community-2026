import { fileURLToPath } from 'node:url';

import remarkGfm from 'remark-gfm';

import { SCSS_LOAD_PATHS, SCSS_PRELUDE } from '../styles.config.mjs';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));

/** @type {import('@storybook/nextjs-vite').StorybookConfig} */
const config = {
	// MDX docs first, then the component stories.
	stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [{
        name: '@storybook/addon-docs',
        // remark-gfm gives the MDX docs GitHub-flavoured markdown — tables, task lists, autolinks.
        // Without it Storybook's MDX renders pipe tables as raw text.
        options: {
            mdxPluginOptions: {
                mdxCompileOptions: {
                    remarkPlugins: [remarkGfm],
                },
            },
        },
    }, // Accessibility panel (axe): flags contrast/label/role issues per story.
    '@storybook/addon-a11y', // Theme toolbar: the withThemeByDataAttribute decorator (in preview) switches data-theme.
    '@storybook/addon-themes', // Toolbar to force :hover / :focus / :active / :disabled on a story without interacting.
    'storybook-addon-pseudo-states', // Sun/moon toggle that switches the Storybook UI (and docs) between the light and dark brand.
    '@storybook-community/storybook-dark-mode'],
	framework: {
		name: '@storybook/nextjs-vite',
		options: {},
	},
	// TypeScript: react-docgen-typescript reads the prop types + TSDoc comments, so autodocs shows
	// clean props tables with descriptions sourced from the types.
	typescript: {
		reactDocgen: 'react-docgen-typescript',
		// Scope docgen to app components so it never tries (and warns about) Storybook's own config.
		reactDocgenTypescriptOptions: {
			include: ['src/**/*.tsx'],
		},
	},
	// Mirrors next.config into Storybook's vite: the same loadPaths (DRY via styles.config) and the
	// @/ alias, so core tokens and imports work in stories exactly as they do in the app.
	viteFinal: async (viteConfig) => ({
		...viteConfig,
		// Next.js inlines NEXT_PUBLIC_* at build time via its own DefinePlugin; Vite does not — it
		// blindly replaces `process.env` with `{}` for browser code. So any component reading
		// process.env.NEXT_PUBLIC_* (here: withBasePath in @/lib/images) sees undefined in Storybook.
		// We inline the one value Storybook needs ourselves, reusing the same env the Pages deploy sets
		// (NEXT_PUBLIC_BASE_PATH=/<repo>). Without this, a Storybook deployed under /<repo>/storybook/
		// points <img>/<source> at the domain root (/media/…) and every asset 404s. Unset locally → ''.
		define: {
			...viteConfig.define,
			'process.env.NEXT_PUBLIC_BASE_PATH': JSON.stringify(process.env.NEXT_PUBLIC_BASE_PATH ?? ''),
		},
		resolve: {
			...viteConfig.resolve,
			alias: {
				...viteConfig.resolve?.alias,
				// Order matters: the more specific supabase alias must precede the '@' catch-all, or
				// Vite resolves the real client first and every dashboard story renders a spinner.
				// Nearly all of them fetch their own data, and usePermissions/useDashboardGuard derive
				// from this same module — so swapping it is what makes those screens renderable at all.
				'@/lib/supabase/client': fileURLToPath(new URL('./mocks/supabase.ts', import.meta.url)),
				'@': srcDir,
			},
		},
		css: {
			...viteConfig.css,
			preprocessorOptions: {
				...viteConfig.css?.preprocessorOptions,
				scss: {
					api: 'modern-compiler',
					loadPaths: SCSS_LOAD_PATHS,
					additionalData: SCSS_PRELUDE,
				},
			},
		},
	}),
};

export default config;
