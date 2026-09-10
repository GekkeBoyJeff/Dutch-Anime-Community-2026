import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';

import * as sass from 'sass-embedded';

import { SCSS_LOAD_PATHS, SCSS_PRELUDE } from '../styles.config.mjs';

const scssFiles = (dir) => {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...scssFiles(path));
		else if (entry.name.endsWith('.scss') && !entry.name.startsWith('_')) out.push(path);
	}
	return out;
};

const files = scssFiles('src/styles');

let failed = 0;
for (const file of files) {
	const source = `${SCSS_PRELUDE}\n${readFileSync(file, 'utf8')}`;
	try {
		sass.compileString(source, { loadPaths: SCSS_LOAD_PATHS, style: 'expanded' });
	} catch (error) {
		failed += 1;
		console.error(`FAIL ${file}\n${error.message}\n`);
	}
}

// A stylesheet that exists but is never imported compiles fine and renders nothing. It is the one
// mistake in this codebase that no compiler, linter or build step would ever mention.
const entry = readFileSync('src/styles/index.ts', 'utf8');
const orphans = files.filter((file) => !entry.includes(`'@/${file.slice('src/'.length)}'`));

for (const orphan of orphans) {
	console.error(`FAIL ${orphan} is never imported in src/styles/index.ts`);
}

console.log(failed ? `\n${failed} stylesheet(s) failed` : `All ${files.length} stylesheets compiled and imported`);
process.exit(failed || orphans.length ? 1 : 0);
