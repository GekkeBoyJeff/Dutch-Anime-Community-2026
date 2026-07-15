import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import * as sass from 'sass-embedded';
import { SCSS_LOAD_PATHS, SCSS_PRELUDE } from '../styles.config.mjs';

function scssFiles(dir) {
	const out = [];
	for (const entry of readdirSync(dir, { withFileTypes: true })) {
		const path = join(dir, entry.name);
		if (entry.isDirectory()) out.push(...scssFiles(path));
		else if (entry.name.endsWith('.scss') && !entry.name.startsWith('_')) out.push(path);
	}
	return out;
}

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

console.log(failed ? `\n${failed} stylesheet(s) failed` : `All ${files.length} stylesheets compiled`);
process.exit(failed ? 1 : 0);
