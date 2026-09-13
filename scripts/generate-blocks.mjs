import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

// Builds the block union and the renderer map from the folders under src/components/contentBlocks,
// so adding a block is adding a folder. Two files, or importing the union would pull in every
// block's component and its CSS. See docs, Adding things.

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
