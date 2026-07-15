import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MEDIA_EXTENSIONS = /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm)$/i;
const GENERATED_DIRS = /(^|\/)_opt(\/|$)/;

export const generateBuilderManifest = async () => {
	const publicDir = path.join(process.cwd(), 'public');
	const manifestPath = path.join(publicDir, 'builder-images.json');

	let entries = [];
	try {
		entries = await readdir(publicDir, { recursive: true, withFileTypes: true });
	} catch {
		// Ignore if public directory doesn't exist or is empty
	}

	const files = entries
		.filter((entry) => entry.isFile() && MEDIA_EXTENSIONS.test(entry.name))
		.map((entry) => {
			const relative = path.relative(publicDir, path.join(entry.parentPath, entry.name));
			const webPath = `/${relative.split(path.sep).join('/')}`;
			const dir = path.dirname(relative);
			return { path: webPath, name: entry.name, dir: dir === '.' ? '/' : dir };
		})
		.filter((file) => !GENERATED_DIRS.test(file.dir))
		.sort((a, b) => a.path.localeCompare(b.path));

	await writeFile(manifestPath, JSON.stringify(files, null, '\t') + '\n');
	return files.length;
};

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
	generateBuilderManifest()
		.then((count) => console.log(`[builder-manifest] ${count} media file(s) indexed`))
		.catch((err) => {
			console.error('[builder-manifest] failed:', err);
			process.exit(1);
		});
}
