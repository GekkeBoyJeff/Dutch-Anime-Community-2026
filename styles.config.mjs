import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { breakpoints } from './src/design-system/breakpoints.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const designSystemDir = join(root, 'src/design-system');

// loadPaths lets `@use "tokens"` / `@use "breakpoints"` resolve from the design-system root instead
// of relatively. One source, shared by next.config and Storybook (DRY).
export const SCSS_LOAD_PATHS = [designSystemDir];

// The SCSS half of the breakpoint scale. breakpoints.mjs explains why it is generated; this writes
// it on import, and both next.config.mjs and .storybook/main.js import this module before any SCSS
// is compiled. The generated file is git-ignored.
const breakpointMap = Object.entries(breakpoints)
	.map(([name, value]) => `\t${name}: ${value},`)
	.join('\n');
writeFileSync(
	join(designSystemDir, '_breakpoints.scss'),
	`// GENERATED from breakpoints.mjs by styles.config.mjs — do not edit by hand.\n$breakpoints: (\n${breakpointMap}\n);\n`,
);

// Prepended to every SCSS file entering the bundler, so every token, function and mixin is available
// without writing `@use` per file. Order matters: _interactions.scss depends on the tokens.
export const SCSS_PRELUDE = '@use "tokens" as *;\n@use "interactions" as *;';
