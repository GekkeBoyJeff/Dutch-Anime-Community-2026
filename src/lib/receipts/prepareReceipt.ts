import imageCompression from 'browser-image-compression';

import { compressPdf } from '@/lib/pdf/compressPdf';

const HEIC_MIME = /^image\/hei[cf]$/i;
const RASTER_MIME = /^image\/(png|jpe?g|gif|avif|webp|bmp|tiff)$/i;
const isHeicName = (name: string): boolean => /\.(heic|heif)$/i.test(name);
const isPdf = (file: File): boolean => file.type === 'application/pdf' || /\.pdf$/i.test(file.name);

// Bewust JPEG i.p.v. webp (dat is ~25-30% kleiner): géén PDF-library embedt webp (react-pdf/pdf-lib/jsPDF
// kunnen alleen JPEG/PNG), dus webp zou bij élke declaratie-PDF-export een lossy canvas-herconversie vergen.
const COMPRESS_OPTS = { maxWidthOrHeight: 2000, maxSizeMB: 0.5, useWebWorker: true, fileType: 'image/jpeg' } as const;

const swapExtension = (name: string, ext: string): string => `${name.replace(/\.[^./\\]+$/, '')}.${ext}`;

// Bereidt een bon voor upload voor. PDF → best-effort compressie via mupdf (zie compressPdf). Afbeelding →
// naar JPEG gecomprimeerd (max 2000px, ~0,5 MB). HEIC (iPhone) wordt eerst via lazy-geladen `heic-to` naar
// JPEG omgezet en daarna dezelfde compressie. Andere types worden geweigerd (bucket accepteert enkel
// jpeg/png/pdf, dus dit voorkomt een verwarrende storage-fout).
export const prepareReceipt = async (file: File): Promise<File> => {
	if (isPdf(file)) return compressPdf(file);

	let raster = file;
	if (HEIC_MIME.test(file.type) || isHeicName(file.name)) {
		const { heicTo } = await import('heic-to');
		const blob = await heicTo({ blob: file, type: 'image/jpeg', quality: 0.9 });
		raster = new File([blob], swapExtension(file.name, 'jpg'), { type: 'image/jpeg' });
	} else if (!RASTER_MIME.test(file.type)) {
		throw new Error('Alleen afbeeldingen (JPG/PNG/HEIC) of een PDF zijn toegestaan.');
	}

	const compressed = await imageCompression(raster, COMPRESS_OPTS);
	// browser-image-compression behoudt de originele bestandsnaam/extensie; forceer .jpg zodat de naam klopt.
	return new File([compressed], swapExtension(raster.name, 'jpg'), { type: 'image/jpeg' });
};
