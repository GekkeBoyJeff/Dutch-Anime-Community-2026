'use client';

// Best-effort client-side PDF compression via vendored Ghostscript-WASM (see public/gs/). Runs in a
// Web Worker so the UI stays responsive. ALWAYS safe: on any error, timeout, or a result that isn't
// smaller, it returns the original file — compression is an enhancement, never a gate on the upload.
// AGPL note: Ghostscript is AGPL-3.0; used here as an internal, self-hosted staff tool.

export type PdfPreset = 'ebook' | 'screen' | 'printer';

// Skip small PDFs: Ghostscript can't meaningfully shrink them and the wasm load isn't worth it.
const MIN_SIZE_TO_COMPRESS = 1.5 * 1024 * 1024;
const TIMEOUT_MS = 90_000;

export const compressPdf = async (file: File, preset: PdfPreset = 'ebook'): Promise<File> => {
	if (file.type !== 'application/pdf' || file.size < MIN_SIZE_TO_COMPRESS) return file;
	try {
		const base = process.env.NEXT_PUBLIC_BASE_PATH || '';
		const input = await file.arrayBuffer();
		const worker = new Worker(`${base}/gs/pdf-worker.js`);

		const out = await new Promise<ArrayBuffer | null>((resolve) => {
			const timer = setTimeout(() => {
				worker.terminate();
				resolve(null);
			}, TIMEOUT_MS);
			worker.onmessage = (event: MessageEvent) => {
				clearTimeout(timer);
				worker.terminate();
				const data = event.data as { ok?: boolean; out?: ArrayBuffer };
				resolve(data?.ok && data.out ? data.out : null);
			};
			worker.onerror = () => {
				clearTimeout(timer);
				worker.terminate();
				resolve(null);
			};
			worker.postMessage({ input, wasmUrl: `${base}/gs/gs.wasm`, gsJsUrl: `${base}/gs/gs.js`, preset }, [input]);
		});

		// Keep the smaller of {compressed, original} — GS can occasionally grow already-optimised PDFs.
		if (!out || out.byteLength === 0 || out.byteLength >= file.size) return file;
		return new File([out], file.name, { type: 'application/pdf' });
	} catch {
		return file;
	}
};
