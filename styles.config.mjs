import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import * as sass from 'sass-embedded';

import { breakpoints } from './src/design-system/breakpoints.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const designSystemDir = join(root, 'src/design-system');

// loadPaths lets `@use "tokens"` / `@use "breakpoints"` resolve from the design-system root instead
// of relatively. One source, shared by next.config and Storybook (DRY).
export const SCSS_LOAD_PATHS = [designSystemDir];

// Prepended to every SCSS file entering the bundler, so every token, function and mixin is available
// without writing `@use` per file. Order matters: _interactions.scss depends on the tokens.
export const SCSS_PRELUDE = '@use "tokens" as *;\n@use "interactions" as *;';

// ── The SCSS half of the breakpoint scale ──
// breakpoints.mjs explains why it is generated. This writes it on import, and both next.config.mjs
// and .storybook/main.js import this module before any SCSS is compiled.
const breakpointMap = Object.entries(breakpoints)
	.map(([name, value]) => `\t${name}: ${value},`)
	.join('\n');
writeFileSync(
	join(designSystemDir, '_breakpoints.scss'),
	`// GENERATED from breakpoints.mjs by styles.config.mjs — do not edit by hand.\n$breakpoints: (\n${breakpointMap}\n);\n`,
);

// ── The theme's custom properties, for code that cannot read CSS ──
// next/og, the web manifest and the viewport theme colour need real colour values, and they run in
// JavaScript. Rather than keep a second copy by hand — which had already drifted — theme.scss is
// compiled here and its palette read back out of the result.
//
// The palette is the FIRST `:root` rule. The `[data-colorset]` rules after it only map those values
// per light/dark half, which a PNG or a manifest cannot use anyway.
const camelCase = (name) => name.replace(/-([a-z0-9])/g, (_, character) => character.toUpperCase());

const themeTokens = () => {
	const source = `${SCSS_PRELUDE}\n${readFileSync(join(designSystemDir, 'theme.scss'), 'utf8')}`;
	const { css } = sass.compileString(source, { loadPaths: SCSS_LOAD_PATHS, style: 'expanded' });

	const palette = css.match(/:root \{([^}]*)\}/);
	if (!palette) throw new Error('theme.scss compiled without a :root rule — the palette moved.');

	const tokens = [...palette[1].matchAll(/--([a-z0-9-]+):\s*([^;]+);/g)];
	if (tokens.length === 0) throw new Error('theme.scss :root holds no custom properties.');

	return tokens.map(([, name, value]) => [camelCase(name), value.trim()]);
};

const tokenLines = themeTokens()
	.map(([name, value]) => `\t${name}: '${value.replace(/'/g, "\\'")}',`)
	.join('\n');
writeFileSync(
	join(designSystemDir, 'theme.generated.ts'),
	'// GENERATED from theme.scss by styles.config.mjs — do not edit by hand.\n'
		+ '// Change a colour in theme.scss; this file follows.\n'
		+ `export const theme = {\n${tokenLines}\n} as const;\n`,
);
