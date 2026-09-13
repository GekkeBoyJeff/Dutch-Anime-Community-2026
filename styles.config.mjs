// Sass settings for next.config.mjs and .storybook/main.js; importing this file regenerates
// _breakpoints.scss, theme.generated.ts and colorsets.generated.ts in src/design-system/.

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as sass from 'sass-embedded';

import { breakpoints } from './src/design-system/breakpoints.mjs';

const designSystemDir = join(dirname(fileURLToPath(import.meta.url)), 'src/design-system');

// Lets `@use "tokens"` resolve from the design-system root instead of relatively.
export const SCSS_LOAD_PATHS = [designSystemDir];

// Prepended to every SCSS file so none needs its own `@use`; _interactions.scss depends on the tokens.
export const SCSS_PRELUDE = '@use "tokens" as *;\n@use "interactions" as *;';

const generatedFrom = (source) => `// GENERATED from ${source} by styles.config.mjs — do not edit by hand.\n`;

const breakpointsScss = () => {
	const entries = Object.entries(breakpoints)
		.map(([name, value]) => `\t${name}: ${value},`)
		.join('\n');

	return `${generatedFrom('breakpoints.mjs')}$breakpoints: (\n${entries}\n);\n`;
};

const compileTheme = () => {
	const source = `${SCSS_PRELUDE}\n${readFileSync(join(designSystemDir, 'theme.scss'), 'utf8')}`;

	return sass.compileString(source, { loadPaths: SCSS_LOAD_PATHS, style: 'expanded' }).css;
};

const themeGeneratedTs = (themeCss) => {
	const camelCase = (name) => name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());

	// Only the first `:root` rule: the `[data-colorset]` rules after it are the light/dark mapping.
	const palette = themeCss.match(/:root \{([^}]*)\}/);
	if (!palette) throw new Error('theme.scss compiled without a :root rule — the palette moved.');

	const tokens = [...palette[1].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)];
	if (tokens.length === 0) throw new Error('theme.scss :root holds no custom properties.');

	const lines = tokens
		.map(([, name, value]) => `\t${camelCase(name)}: '${value.trim().replace(/'/g, "\\'")}',`)
		.join('\n');

	return generatedFrom('theme.scss')
		+ '// Change a colour in theme.scss; this file follows.\n'
		+ `export const theme = {\n${lines}\n} as const;\n`;
};

const colorsetsGeneratedTs = (themeCss) => {
	const selectors = themeCss.matchAll(/\[data-colorset=['"]?([a-z0-9-]+)['"]?\]/g);
	const names = [...new Set([...selectors].map(([, name]) => name))];
	if (names.length === 0) throw new Error('theme.scss emitted no [data-colorset] rule — the colorsets moved.');

	return generatedFrom('theme.scss')
		+ '// Add a [data-colorset] block to theme.scss; this file follows.\n'
		+ `export const COLORSETS = [${names.map((name) => `'${name}'`).join(', ')}] as const;\n`;
};

// _breakpoints.scss first: _tokens.scss reads it, so it must exist before theme.scss compiles.
writeFileSync(join(designSystemDir, '_breakpoints.scss'), breakpointsScss());

const themeCss = compileTheme();
writeFileSync(join(designSystemDir, 'theme.generated.ts'), themeGeneratedTs(themeCss));
writeFileSync(join(designSystemDir, 'colorsets.generated.ts'), colorsetsGeneratedTs(themeCss));
