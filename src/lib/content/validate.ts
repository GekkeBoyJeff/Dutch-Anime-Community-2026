import { z } from 'zod';

interface ContentErrorOptions {
	/** Human label for the content kind, e.g. 'page content' or '404 content'. */
	label: string;
	/**
	 * Turns a Zod issue path into a source-friendly location, so the error points at the actual
	 * file/route instead of a bare array index. `source` groups the issue (a page route);
	 * `field` is the dotted path within that item (e.g. `meta.title`).
	 */
	locate: (path: readonly PropertyKey[]) => { source: string; field: string };
}

// Parses a content registry against its schema and, on failure, throws a clean, grouped, source-aware
// error. The readable message lands at the top of `next build`'s output AND in the dev error-overlay,
// so a bad value points you straight at the file + field — not at an array index or a runtime chunk.
// Used by the page accessor for both the page registry and the 404 page, so all content failures
// report identically (DRY).
export const parseContent = <Schema extends z.ZodType>(
	schema: Schema,
	raw: unknown,
	{ label, locate }: ContentErrorOptions,
): z.infer<Schema> => {
	const result = schema.safeParse(raw);
	if (result.success) {
		return result.data;
	}

	// Group every issue under its source (the page route) so all problems in one file read
	// together instead of as a flat list of indices.
	const bySource = new Map<string, string[]>();
	for (const issue of result.error.issues) {
		const { source, field } = locate(issue.path);
		const entry = `   └ ${field || '(root)'}\n     ${issue.message}`;
		bySource.set(source, [...(bySource.get(source) ?? []), entry]);
	}

	const report = [...bySource.entries()]
		.map(([source, entries]) => `  ${source}\n${entries.join('\n')}`)
		.join('\n\n');
	const count = result.error.issues.length;

	throw new Error(`✖ Invalid ${label} — ${count} problem${count === 1 ? '' : 's'}:\n\n${report}\n`);
}
