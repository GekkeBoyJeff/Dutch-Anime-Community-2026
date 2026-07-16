import { copyFileSync, mkdirSync } from 'node:fs';

// Vendors the Ghostscript-WASM runtime into public/gs/ so the static export serves it at /gs/*.
// gs.js (emscripten glue) + gs.wasm (~16MB) are copied from node_modules (git-ignored, regenerated on
// every build); public/gs/pdf-worker.js is hand-written and committed. Runs as part of `npm run images`.
const SRC = 'node_modules/@jspawn/ghostscript-wasm';
const DEST = 'public/gs';

mkdirSync(DEST, { recursive: true });
for (const file of ['gs.js', 'gs.wasm']) {
	copyFileSync(`${SRC}/${file}`, `${DEST}/${file}`);
	console.log('[gs] copied', file);
}
