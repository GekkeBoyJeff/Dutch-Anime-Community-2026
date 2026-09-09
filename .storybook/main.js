import { fileURLToPath } from 'node:url';

import remarkGfm from 'remark-gfm';

import { SCSS_LOAD_PATHS, SCSS_PRELUDE } from '../styles.config.mjs';

const srcDir = fileURLToPath(new URL('../src', import.meta.url));

/** @type {import('@storybook/nextjs-vite').StorybookConfig} */
const config = {
	stories: ['../src/stories/**/*.mdx', '../src/stories/**/*.stories.@(js|jsx|ts|tsx)'],
	addons: [
		{
			name: '@storybook/addon-docs',
			options: {
				mdxPluginOptions: {
					mdxCompileOptions: {
						remarkPlugins: [remarkGfm],
					},
				},
			},
		},
		'@storybook/addon-a11y',
		'storybook-addon-pseudo-states',
		'@storybook-community/storybook-dark-mode',
		'@storybook/addon-mcp',
		'@storybook/addon-vitest',
	],
	framework: {
		name: '@storybook/nextjs-vite',
		options: {},
	},
	typescript: {
		reactDocgen: 'react-docgen-typescript',
		reactDocgenTypescriptOptions: {
			include: ['src/**/*.tsx'],
		},
	},
	viteFinal: async (viteConfig) => ({
		...viteConfig,
		// Vite replaces `process.env` with `{}` instead of inlining NEXT_PUBLIC_* the way Next does, so
		// without this withBasePath (@/lib/images) reads undefined and every asset 404s under a base path.
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
				'@/lib/shared/supabase/client': fileURLToPath(new URL('./mocks/supabase.ts', import.meta.url)),
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
