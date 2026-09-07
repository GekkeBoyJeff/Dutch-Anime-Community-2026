import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const stylesDir = join(root, 'src/styles');

// loadPaths lets `@use "tokens"` / `@use "breakpoints"` resolve from the styles root instead of
// relatively. One source, shared by next.config and Storybook (DRY).
export const SCSS_LOAD_PATHS = [stylesDir];

// ── Single source of breakpoints ──
// The breakpoint scale lives in exactly ONE place — src/styles/breakpoints.json — so the JS side (the
// Media component's `<source media="(min-width: …)">` queries) and the SCSS side (`bp()`/`breakpoint()`
// in _tokens.scss) can never drift. Here we generate the SCSS partial `_breakpoints.scss` from that
// JSON; `_tokens.scss` `@use`s it. The generated file is git-ignored. This runs on import, and both
// next.config.mjs and .storybook/main.js import this module before any SCSS is compiled.
const breakpoints = JSON.parse(readFileSync(join(stylesDir, 'breakpoints.json'), 'utf8'));
const breakpointMap = Object.entries(breakpoints)
	.map(([name, value]) => `\t${name}: ${value},`)
	.join('\n');
writeFileSync(
	join(stylesDir, '_breakpoints.scss'),
	`// GENERATED from breakpoints.json by styles.config.mjs — do not edit by hand.\n$breakpoints: (\n${breakpointMap}\n);\n`,
);

// Prepended to every SCSS file entering the bundler, so every token, function and mixin is available
// without writing `@use` per file. Order matters: _interactions.scss depends on the tokens.
export const SCSS_PRELUDE = '@use "tokens" as *;\n@use "interactions" as *;';
