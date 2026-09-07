import { createHash } from 'node:crypto';
import { access, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';

import sharp from 'sharp';

const CONFIG = {
	srcDir: 'public/media',
	optDir: 'public/media/_opt',
	publicBase: '/media',
	optPublicBase: '/media/_opt',
	manifestPath: 'src/lib/site/images/manifest.json',
	widths: [320, 480, 640, 768, 1024, 1280, 1536, 1920],
	maxWidth: 2560,
	quality: 80,
	extensions: ['.jpg', '.jpeg', '.png'],
};

const variantWidths = (intrinsicWidth) => {
	const top = Math.min(intrinsicWidth, CONFIG.maxWidth);
	return [...CONFIG.widths.filter((w) => w < top), top];
};

const exists = async (filePath) => {
	try {
		await access(filePath);
		return true;
	} catch {
		return false;
	}
};

const optimizeImages = async () => {
	const root = process.cwd();
	const srcDir = path.join(root, CONFIG.srcDir);
	const optDir = path.join(root, CONFIG.optDir);
	const manifestPath = path.join(root, CONFIG.manifestPath);

	let previous = {};
	try {
		previous = JSON.parse(await readFile(manifestPath, 'utf8'));
	} catch {
		previous = {};
	}

	let names = [];
	try {
		names = (await readdir(srcDir)).filter((name) => CONFIG.extensions.includes(path.extname(name).toLowerCase()));
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

		// SHA-1 used as a cache discriminator (content-change detection), not a security primitive.
		const hash = createHash('sha1').update(buffer).digest('hex');
		const key = `${CONFIG.publicBase}/${name}`;
		const base = name.slice(0, name.length - path.extname(name).length);
		const widths = variantWidths(meta.width);
		const variants = widths.map((w) => ({ w, url: `${CONFIG.optPublicBase}/${base}-${w}.webp` }));
		// Track all expected variant filenames for every current source (so cached sources aren't pruned).
		variants.forEach((v) => keptFiles.add(path.basename(v.url)));

		const filesExist =
			previous[key]?.hash === hash
				? (await Promise.all(variants.map((v) => exists(path.join(optDir, path.basename(v.url)))))).every(Boolean)
				: false;

		if (!filesExist) {
			for (const w of widths) {
				await sharp(buffer)
					.resize({ width: w })
					.webp({ quality: CONFIG.quality })
					.toFile(path.join(optDir, `${base}-${w}.webp`));
			}
		}

		manifest[key] = { width: meta.width, height: meta.height, hash, variants };
	}

	for (const file of await readdir(optDir)) {
		if (!keptFiles.has(file)) await rm(path.join(optDir, file));
	}

	await mkdir(path.dirname(manifestPath), { recursive: true });
	await writeFile(manifestPath, `${JSON.stringify(manifest, null, '\t')}\n`);
	return manifest;
};

optimizeImages()
	.then((m) => console.log(`[images] ${Object.keys(m).length} source image(s) processed`))
	.catch((err) => {
		console.error('[images] failed:', err);
		process.exit(1);
	});
