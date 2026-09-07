import { withThemeByDataAttribute } from '@storybook/addon-themes';
import type { Decorator } from '@storybook/nextjs-vite';
import { useDarkMode } from '@storybook-community/storybook-dark-mode';
import { DarkModeDocsContainer } from '@storybook-community/storybook-dark-mode/docs';
import type { ArgTypesEnhancer } from 'storybook/internal/csf';
import { useEffect } from 'storybook/preview-api';

import Notification from '@/components/components/Notification';
import NotificationProvider from '@/components/components/NotificationProvider';

import { withJsonSchema, withJsonSchemaArgTypes } from './addons/json-schema/preview';
import { light, dark } from './theme';
import '@/styles';
import './docs.css';

// Decorators only run around a story, so a pure MDX page (Colors, Spacing, the developer docs)
// would render on the default theme no matter what the toolbar says. Seed the brand theme on the
// preview document itself; withThemeByDataAttribute still overrides it per story.
if (typeof document !== 'undefined') {
	document.documentElement.setAttribute('data-theme', 'dac');
}

export const tags = ['autodocs'];

export const parameters = {
	// Without it usePathname() returns null in the canvas and app-router components (e.g. Navigation's
	// active-route check) crash.
	nextjs: { appDirectory: true },
	options: {
		storySort: {
			order: [
				'Start here',
				'For developers', ['1. Architecture', '2. Conventions', '3. Adding things', '4. Content & data', '5. Validation', '6. SEO & sharing', '7. Hooks', '8. Staff platform', '9. The visual editor'],
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
		container: DarkModeDocsContainer,
		toc: {
			headingSelector: 'h2, h3',
			ignoreSelector: '.docs-story *',
			title: 'On this page',
		},
	},
	darkMode: {
		current: 'light',
		light,
		dark,
	},
};

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

const withPreviewContext: Decorator = (Story, context) => {
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

const withDashboardSurface: Decorator = (Story, context) => {
	if (!context.title?.startsWith('Dashboard/')) return <Story />;

	// Screens that report success or failure call useToastManager, which throws without this provider.
	return (
		<div style={{ background: 'var(--page)', color: 'var(--color)', padding: '2rem', borderRadius: '1rem' }}>
			<NotificationProvider>
				<Story />
				<Notification position="bottom-right" />
			</NotificationProvider>
		</div>
	);
};

export const decorators = [
	withDashboardSurface,
	withPreviewContext,
	withJsonSchema,
	withThemeByDataAttribute({
		themes: { default: 'default', dac: 'dac', sepia: 'sepia' },
		defaultTheme: 'dac',
		attributeName: 'data-theme',
	}),
];
