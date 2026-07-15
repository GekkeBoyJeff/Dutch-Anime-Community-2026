import { readdir } from 'node:fs/promises';
import path from 'node:path';

import { env } from '@/lib/env';

// Development-only: lists the media files under /public for the builder's file picker (the
// `editor: 'file'` fields). Mirrors the /builder gate — production answers 404 — and the static
// deploy never ships it (the workflow strips src/app/api before that build).

const MEDIA_EXTENSIONS = /\.(png|jpe?g|webp|avif|gif|svg|mp4|webm)$/i;

// Generated derivatives (scripts/optimize-images.mjs) — content should reference the source file.
const GENERATED_DIRS = /(^|\/)_opt(\/|$)/;

export const dynamic = 'force-dynamic';

export const GET = async () => {
	if (env.NODE_ENV === 'production') {
		return new Response('Not found', { status: 404 });
	}

	const publicDir = path.join(process.cwd(), 'public');
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

	return Response.json(files);
};
