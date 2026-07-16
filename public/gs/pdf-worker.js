// Classic Web Worker: runs vendored Ghostscript-WASM to compress a PDF, off the main thread.
// Loaded at runtime from /gs/ (not bundled by Next), so there are no emscripten/bundler interop issues.
// Any failure posts { ok:false } and the caller falls back to the original file.

self.onmessage = async (event) => {
	const { input, wasmUrl, gsJsUrl, preset } = event.data;
	try {
		// gs.js (emscripten, browser build) assigns the module factory to globalThis.exports.Module.
		self.exports = {};
		importScripts(gsJsUrl);
		const createModule = self.exports.Module;
		if (typeof createModule !== 'function') throw new Error('gs.js did not expose a module factory');

		const wasmBinary = new Uint8Array(await (await fetch(wasmUrl)).arrayBuffer());
		let mod = createModule({
			noInitialRun: true,
			wasmBinary,
			locateFile: () => wasmUrl,
			print: () => {},
			printErr: () => {},
		});
		mod = await mod; // factory may return the instance or a promise for it
		if (mod && typeof mod.ready?.then === 'function') {
			try {
				await mod.ready;
			} catch {
				/* some builds resolve ready to the instance and re-throw on re-await; ignore */
			}
		}

		const setting = preset === 'screen' ? '/screen' : preset === 'printer' ? '/printer' : '/ebook';
		mod.FS.writeFile('input.pdf', new Uint8Array(input));
		mod.callMain([
			'-sDEVICE=pdfwrite',
			'-dCompatibilityLevel=1.5',
			`-dPDFSETTINGS=${setting}`,
			'-dNOPAUSE',
			'-dQUIET',
			'-dBATCH',
			'-sOutputFile=output.pdf',
			'input.pdf',
		]);
		const out = mod.FS.readFile('output.pdf');
		self.postMessage({ ok: true, out: out.buffer }, [out.buffer]);
	} catch (err) {
		self.postMessage({ ok: false, error: String(err) });
	}
};
