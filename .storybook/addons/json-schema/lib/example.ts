import type { JsonSchemaNode } from './walk';

// Value preference: const > default > examples[0] > enum[0] > per-type placeholder. Placeholders
// mirror the reference UI: strings become '<string>', numbers 0, booleans true.
export const buildExample = (node: JsonSchemaNode, depth = 0): unknown => {
	if (!node || typeof node !== 'object' || depth > 12) return null;
	if (node.const !== undefined) return node.const;
	if (node.default !== undefined) return node.default;
	if (Array.isArray(node.examples) && node.examples.length > 0) return node.examples[0];
	if (Array.isArray(node.enum) && node.enum.length > 0) return node.enum[0];
	const variants = node.anyOf ?? node.oneOf;
	if (Array.isArray(variants) && variants.length > 0) return buildExample(variants[0], depth + 1);
	switch (node.type) {
		case 'object':
			return Object.fromEntries(
				Object.entries(node.properties ?? {}).map(([key, child]) => [key, buildExample(child as JsonSchemaNode, depth + 1)]),
			);
		case 'array':
			return [buildExample(node.items ?? {}, depth + 1)];
		case 'string':
			return '<string>';
		case 'number':
		case 'integer':
			return 0;
		case 'boolean':
			return true;
		case 'null':
			return null;
		default:
			return '<any>';
	}
};
