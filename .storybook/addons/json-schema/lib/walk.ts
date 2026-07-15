export type JsonSchemaNode = Record<string, any>;
export type SchemaPath = (string | number)[];

// A string segment names a property; when that property is an array we descend into its items
// directly, so 'actions' navigates to the HeroAction object. A number segment picks an
// anyOf/oneOf variant. Paths never reference $defs names — those churn across HMR.
export const resolveNode = (root: JsonSchemaNode, path: SchemaPath): JsonSchemaNode | null => {
	let node: JsonSchemaNode | null = root;
	for (const segment of path) {
		if (!node) return null;
		if (typeof segment === 'number') {
			const variants = node.anyOf ?? node.oneOf;
			node = Array.isArray(variants) ? (variants[segment] ?? null) : null;
			continue;
		}
		node = node.properties?.[segment] ?? null;
		if (node && node.type === 'array' && node.items) node = node.items;
	}
	return node;
};

export const listProperties = (node: JsonSchemaNode): { name: string; node: JsonSchemaNode; required: boolean }[] => {
	const required: string[] = Array.isArray(node.required) ? node.required : [];
	return Object.entries(node.properties ?? {}).map(([name, child]) => ({
		name,
		node: child as JsonSchemaNode,
		required: required.includes(name),
	}));
};

const plainType = (node: JsonSchemaNode): string => {
	if (Array.isArray(node.enum)) return `enum(${node.enum.join(' | ')})`;
	if (node.const !== undefined) return `const ${JSON.stringify(node.const)}`;
	if (node.type === 'array') {
		const items = node.items ?? {};
		return `array of ${items.title ?? items.type ?? 'any'}`;
	}
	return String(node.type ?? 'any');
};

// A union variant's display text: consts (e.g. `columns`'s 2|3|4) show their literal value rather
// than the useless "number" every const shares as its `type`.
const variantLabel = (v: JsonSchemaNode): string => {
	if (v.const !== undefined) return String(v.const);
	if (v.title) return v.title;
	if (v.type === 'array') {
		const items = v.items ?? {};
		return `array of ${items.title ?? items.type ?? 'any'}`;
	}
	return String(v.type ?? 'any');
};

// Same array-auto-descend as describeType's own navigable check, applied per variant.
const variantNavigable = (v: JsonSchemaNode): boolean => {
	const effective = v.type === 'array' && v.items ? v.items : v;
	return effective.type === 'object' && !!effective.properties;
};

export const describeType = (
	node: JsonSchemaNode,
): { label: string; navigable: boolean; variants?: { label: string; index: number }[] } => {
	const variants = node.anyOf ?? node.oneOf;
	if (Array.isArray(variants)) {
		// Const-only unions (columns: 2|3|4) and primitive unions (StatItem.value: string|number) have
		// nowhere useful to navigate to, so render them as plain type text instead of dead-end links.
		if (!variants.some((v: JsonSchemaNode) => variantNavigable(v))) {
			return {
				label: node.title ?? variants.map((v: JsonSchemaNode) => variantLabel(v)).join(' | '),
				navigable: false,
			};
		}
		return {
			label: node.title ?? 'union',
			navigable: false,
			variants: variants.map((v: JsonSchemaNode, index: number) => ({
				label: variantLabel(v) || `option ${index + 1}`,
				index,
			})),
		};
	}
	const effective = node.type === 'array' && node.items ? node.items : node;
	const navigable = effective.type === 'object' && !!effective.properties;
	return { label: node.title ?? effective.title ?? plainType(node), navigable };
};

export const formatPath = (path: (string | number)[]): string =>
	path.length === 0
		? '(root)'
		: path.map((p, i) => (typeof p === 'number' ? `[${p}]` : i === 0 ? String(p) : `.${p}`)).join('');
