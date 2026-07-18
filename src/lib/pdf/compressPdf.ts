// Best-effort client-side PDF-optimalisatie via pdf-lib — puur TypeScript, geen WASM, geen worker, geen
// public/-vendoring en geen build-copy-script. pdf-lib herserialiseert het document met object-streams (een
// compacte cross-reference) en laat pdf-lib de mod-date/producer niet bijwerken; dat levert winst op bij
// "digitale" PDF's. Let op: pdf-lib doet GEEN image-downsampling (dat vereist WASM) — fotobonnen worden al
// als afbeelding gecomprimeerd (zie prepareReceipt), dus dat gat doet er hier nauwelijks toe. Op élke fout of
// een niet-kleiner resultaat wordt het origineel teruggegeven: optimalisatie is nooit een blokkade.

// Kleine PDF's leveren de moeite niet op.
const MIN_SIZE_TO_COMPRESS = 1.5 * 1024 * 1024; // 1,5 MB

export const compressPdf = async (file: File): Promise<File> => {
	if (file.type !== 'application/pdf' || file.size < MIN_SIZE_TO_COMPRESS) return file;
	try {
		const { PDFDocument } = await import('pdf-lib');
		const doc = await PDFDocument.load(await file.arrayBuffer(), { updateMetadata: false });
		const saved = await doc.save({ useObjectStreams: true });
		// Houd de kleinste van {geoptimaliseerd, origineel} — een al-geoptimaliseerde PDF kan groeien.
		if (saved.byteLength === 0 || saved.byteLength >= file.size) return file;
		const bytes = new Uint8Array(saved.byteLength); // eigen ArrayBuffer → geldige BlobPart.
		bytes.set(saved);
		return new File([bytes], file.name, { type: 'application/pdf' });
	} catch {
		return file;
	}
};
