import { createHash } from 'node:crypto';
import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import sharp from 'sharp';

// Config kept here (no separate config file — YAGNI). Paths are relative to `root` (cwd by default).
const DEFAULTS = {
	srcDir: 'public/media',
	optDir: 'public/media/_opt',
	publicBase: '/media',
	optPublicBase: '/media/_opt',
	manifestPath: 'src/lib/images/manifest.json',
	widths: [320, 480, 640, 768, 1024, 1280, 1536],
	quality: 80,
	extensions: ['.jpg', '.jpeg', '.png'],
};

// Widths to emit for a source: ladder values below the intrinsic width, plus the intrinsic width
// itself as the largest candidate. Never exceeds the source (no upscaling). Deduped, ascending.
export const variantWidths = (intrinsicWidth, ladder = DEFAULTS.widths) => {
	const below = ladder.filter((w) => w < intrinsicWidth);
	return [...new Set([...below, intrinsicWidth])].sort((a, b) => a - b);
};

// SHA-1 used as a cache discriminator (content-change detection), not a security primitive.
const hashBuffer = (buffer) => {
	return createHash('sha1').update(buffer).digest('hex');
};

const exists = async (filePath) => {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
};

// Generates webp variants for every image in srcDir and writes the manifest. Idempotent: a source
// whose hash is unchanged AND whose variant files all still exist is skipped; orphaned variants are
// pruned. Unreadable/unprocessable files are logged and skipped (never fail the build).
export const optimizeImages = async (config = {}) => {
	const cfg = { ...DEFAULTS, ...config };
	const root = cfg.root ?? process.cwd();
	const srcDir = path.join(root, cfg.srcDir);
	const optDir = path.join(root, cfg.optDir);
	const manifestPath = path.join(root, cfg.manifestPath);

	let previous = {};
	try {
		previous = JSON.parse(await readFile(manifestPath, 'utf8'));
	} catch {
		previous = {};
	}

	let names = [];
	try {
		names = (await readdir(srcDir)).filter((name) => cfg.extensions.includes(path.extname(name).toLowerCase()));
	} catch {
		names = [];
	}

	await mkdir(optDir, { recursive: true });

	const manifest = {};
	const keptFiles = new Set();

	for (const name of names) {
		let buffer;
		try {
			buffer = await readFile(path.join(srcDir, name));
		} catch {
			console.warn(`[images] skipped unreadable file: ${name}`);
			continue;
		}

		let meta;
		try {
			meta = await sharp(buffer).metadata();
		} catch {
			console.warn(`[images] skipped unprocessable image: ${name}`);
			continue;
		}

		if (!meta.width || !meta.height) {
			console.warn(`[images] skipped image with no dimensions: ${name}`);
			continue;
		}

		const hash = hashBuffer(buffer);
		const key = `${cfg.publicBase}/${name}`;
		const base = name.slice(0, name.length - path.extname(name).length);
		const widths = variantWidths(meta.width, cfg.widths);
		const variants = widths.map((w) => ({ w, url: `${cfg.optPublicBase}/${base}-${w}.webp` }));
		// Track all expected variant filenames for every current source (so cached sources aren't pruned).
		variants.forEach((v) => keptFiles.add(path.basename(v.url)));

		const cached = previous[key];
		const filesExist =
			cached && cached.hash === hash
				? (await Promise.all(variants.map((v) => exists(path.join(optDir, path.basename(v.url)))))).every(Boolean)
				: false;

		if (!filesExist) {
			for (const w of widths) {
				await sharp(buffer)
					.resize({ width: w })
					.webp({ quality: cfg.quality })
					.toFile(path.join(optDir, `${base}-${w}.webp`));
			}
		}

		manifest[key] = { width: meta.width, height: meta.height, hash, variants };
	}

	// Prune variant files no longer referenced by the manifest (renamed/deleted sources).
	let existing = [];
	try {
		existing = await readdir(optDir);
	} catch {
		existing = []; // optDir may be absent
	}
	for (const file of existing) {
		if (!keptFiles.has(file)) await rm(path.join(optDir, file));
	}

	await mkdir(path.dirname(manifestPath), { recursive: true });
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`);
	return manifest;
};

// CLI entry: run only when invoked directly (node scripts/optimize-images.mjs).
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	optimizeImages()
		.then((m) => console.log(`[images] ${Object.keys(m).length} source image(s) processed`))
		.catch((err) => {
			console.error('[images] failed:', err);
			process.exit(1);
		});
}
