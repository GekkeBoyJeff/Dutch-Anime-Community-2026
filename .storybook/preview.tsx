import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Decorator } from '@storybook/nextjs-vite';
import { useDarkMode } from '@storybook-community/storybook-dark-mode';
import { DarkModeDocsContainer } from '@storybook-community/storybook-dark-mode/docs';
import type { ArgTypesEnhancer } from 'storybook/internal/csf';
import { useEffect } from 'storybook/preview-api';

import { withJsonSchema, withJsonSchemaArgTypes } from './addons/json-schema/preview';
import { light, dark } from './theme';
import '@/styles';

// Global autodocs: every component story automatically gets a "Docs" tab with a props table
// (fed by the component prop types + TSDoc) and all its stories.
export const tags = ['autodocs'];

export const parameters = {
	// App Router context for stories: without it usePathname() returns null in the Storybook canvas and
	// app-router components (e.g. Navigation's active-route check) crash. Mocks the pathname to '/'.
	nextjs: { appDirectory: true },
	options: {
		// A fixed, readable sidebar order instead of alphabetical.
		storySort: {
			order: [
				'Start here',
				'For developers', ['1. Architecture', '2. Conventions', '3. Adding things', '4. Content & data', '5. Validation', '6. SEO & sharing', '7. Hooks'],
				'Look & feel', ['Colors', 'Typography', 'Spacing'],
				'Basics',
				'Components',
				'ContentBlocks',
				'Structures',
				'Forms',
			],
		},
	},
	docs: {
		// Make the docs pages follow the light/dark toggle too (not just the manager chrome).
		container: DarkModeDocsContainer,
		// Right-hand "On this page" index. headingSelector must include h2 (the default is h3 only,
		// which left section-only pages with an empty or partial TOC). ignoreSelector drops headings
		// rendered inside a story preview (e.g. a Hero's own <h1>) so only the doc's own headings show.
		toc: {
			headingSelector: 'h2, h3',
			ignoreSelector: '.docs-story *',
			title: 'On this page',
		},
	},
	// One light/dark switch for the whole workshop. The sun/moon toggle (top toolbar) is the single
	// source of truth: it themes the Storybook chrome + docs here, and the decorator below mirrors it
	// onto the preview's [data-colorset] so the rendered components flip in lockstep. (A specific story
	// can still pin its own colorset by rendering inside a <Section colorset="…">.)
	darkMode: {
		current: 'light',
		light,
		dark,
	},
};

// DRY actions: every event-handler prop (onClick, onChange, onValueChange, …) is auto-logged to the
// Actions panel, library-wide, with no per-story boilerplate. We stamp `action` onto each handler
// argType here; Storybook's built-in args enhancer (addActionsFromArgTypes) then injects a spy that
// logs — but only when a story hasn't supplied its own handler, so explicit `fn()` args still win.
//
// Match the `onX` NAME only — NOT every function-typed prop. Data-transform functions (itemToStringLabel,
// filter, renderItem, comparators, …) are not events; spying them would replace them with a no-op that
// returns undefined, breaking any component that relies on their return value (e.g. Combobox labels).
const isCallbackArg = (name: string) => /^on[A-Z]/.test(name);

export const argTypesEnhancers: ArgTypesEnhancer[] = [
	(context) => {
		const argTypes = context.argTypes ?? {};
		return Object.fromEntries(
			Object.entries(argTypes).map(([name, argType]) =>
				isCallbackArg(name) && !argType.action
					? [name, { ...argType, action: name, control: false as const, table: { ...argType.table, category: 'Events' } }]
					: [name, argType],
			),
		);
	},
	withJsonSchemaArgTypes,
];

// Toolbar switch for text direction so any story can be checked in LTR or RTL without a second story.
// (Light/dark is the sun/moon toggle above; the brand theme is the addon-themes toolbar below.)
export const globalTypes = {
	direction: {
		description: 'Text direction',
		toolbar: {
			icon: 'transfer',
			title: 'Direction',
			items: [
				{ value: 'ltr', title: 'LTR' },
				{ value: 'rtl', title: 'RTL' },
			],
			dynamicTitle: true,
		},
	},
};

export const initialGlobals = {
	direction: 'ltr',
};

// Mirror the single light/dark toggle onto the preview <body> (exactly as the app does with
// <body data-colorset>), and apply the chosen text direction. The whole canvas reflects them, and any
// component without its own colorset inherits; a component that sets its own colorset still wins.
const withPreviewContext: Decorator = (Story, context) => {
	// Storybook's dark-mode + preview-api hooks, valid inside a decorator. The react-hooks rule can't
	// tell them apart from React's, so disable it for this idiomatic pattern.
	// eslint-disable-next-line react-hooks/rules-of-hooks
	const isDark = useDarkMode();
	const { direction } = context.globals;

	// eslint-disable-next-line react-hooks/rules-of-hooks
	useEffect(() => {
		document.body.setAttribute('data-colorset', isDark ? 'dark' : 'light');
		document.body.setAttribute('dir', String(direction));
	}, [isDark, direction]);

	return <Story />;
};

// Dashboard-tier stories are the admin work-surface, not the public site — render them under
// data-theme="admin" on the admin page canvas so the Studio tokens (surface ladder, gold accent,
// stacked shadows) resolve and the story is a faithful proof of the shipped skin.
const withDashboardTheme: Decorator = (Story, context) => {
	if (!context.title?.startsWith('Dashboard/')) return <Story />;

	return (
		<div data-theme="admin" style={{ background: 'var(--admin-page)', color: 'var(--admin-ink-1)', padding: '2rem', borderRadius: '1rem' }}>
			<Story />
		</div>
	);
};

export const decorators = [
	withDashboardTheme,
	withPreviewContext,
	withJsonSchema,
	// Brand-theme toolbar (a separate axis from light/dark): sets data-theme on <html>. 'dac' and
	// 'sepia' are the themes in the THEME section of src/styles/base.scss — add more there and here.
	// The default is 'dac' because the site itself renders under data-theme="dac" (src/app/layout.tsx);
	// reviewing stories under any other palette would not represent what ships.
	withThemeByDataAttribute({
		themes: { default: 'default', dac: 'dac', sepia: 'sepia', admin: 'admin' },
		defaultTheme: 'dac',
		attributeName: 'data-theme',
	}),
];
