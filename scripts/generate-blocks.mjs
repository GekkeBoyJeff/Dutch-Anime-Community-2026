import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// ── The block registry, derived from the folders ──
// A content block is a folder under src/components/contentBlocks with a schema that declares a
// `type` literal and a component to draw it. Both lists below used to be written by hand, which
// meant adding a block meant editing files elsewhere. Now the folder IS the registration, and the
// two generated files are what the rest of the app reads.
//
// Two files, not one, on purpose: the union must stay reachable without pulling in React components,
// or every route that knows what a Page is would ship every block's CSS.
//
// Generated on import by next.config.mjs and .storybook/main.js, the same way styles.config.mjs
// generates _breakpoints.scss.

const BLOCKS_DIR = 'src/components/contentBlocks';
const OUT_DIR = join(BLOCKS_DIR, 'Blocks');
const HEADER = '// GENERATED from the folders in src/components/contentBlocks by scripts/generate-blocks.mjs.\n// Do not edit by hand: add a block by adding its folder.\n';

const discover = () => {
	const blocks = [];
	for (const entry of readdirSync(BLOCKS_DIR, { withFileTypes: true })) {
		if (!entry.isDirectory() || entry.name === 'Blocks') continue;
		const name = entry.name;

		let schema;
		try {
			schema = readFileSync(join(BLOCKS_DIR, name, `${name}.schema.ts`), 'utf8');
		} catch {
			throw new Error(`${BLOCKS_DIR}/${name} has no ${name}.schema.ts — a content block needs one.`);
		}

		if (!schema.includes(`export const ${name}Block`)) {
			throw new Error(`${name}.schema.ts does not export ${name}Block — a content block needs a Block variant.`);
		}

		const type = schema.match(/type: z\.literal\('([^']+)'\)/)?.[1];
		if (!type) {
			throw new Error(`${name}.schema.ts has no \`type: z.literal('…')\` — that literal is the block's name in page data.`);
		}

		blocks.push({ name, type });
	}
	return blocks.sort((a, b) => a.name.localeCompare(b.name));
};

export const generateBlocks = () => {
	const blocks = discover();

	const schemaFile = `${HEADER}import { z } from 'zod';

${blocks.map(({ name }) => `import { ${name}Block } from '@/components/contentBlocks/${name}/${name}.schema';`).join('\n')}

export const Block = z.discriminatedUnion('type', [
${blocks.map(({ name }) => `\t${name}Block,`).join('\n')}
]);
export type Block = z.infer<typeof Block>;
`;

	const registryFile = `${HEADER}${blocks.map(({ name }) => `import ${name} from '@/components/contentBlocks/${name}/${name}';`).join('\n')}

export const RENDERERS = {
${blocks.map(({ name, type }) => `\t${type}: ${name},`).join('\n')}
};
`;

	writeFileSync(join(OUT_DIR, 'Blocks.schema.generated.ts'), schemaFile);
	writeFileSync(join(OUT_DIR, 'Blocks.registry.generated.ts'), registryFile);
	return blocks.length;
};
