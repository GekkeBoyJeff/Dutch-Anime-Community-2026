import { readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const MEDIA_EXTENSIONS = /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm)$/i;
const GENERATED_DIRS = /(^|\/)_opt(\/|$)/;

const generateBuilderManifest = async () => {
	const publicDir = path.join(process.cwd(), 'public');
	const manifestPath = path.join(publicDir, 'builder-images.json');
	const entries = await readdir(publicDir, { recursive: true, withFileTypes: true });

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

generateBuilderManifest()
	.then((count) => console.log(`[builder-manifest] ${count} media file(s) indexed`))
	.catch((err) => {
		console.error('[builder-manifest] failed:', err);
		process.exit(1);
	});
