import { z } from 'zod';

interface ContentErrorOptions {
	label: string;
	locate: (path: readonly PropertyKey[]) => { source: string; field: string };
}

export const parseContent = <Schema extends z.ZodType>(
	schema: Schema,
	raw: unknown,
	{ label, locate }: ContentErrorOptions,
): z.infer<Schema> => {
	const result = schema.safeParse(raw);
	if (result.success) return result.data;

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
