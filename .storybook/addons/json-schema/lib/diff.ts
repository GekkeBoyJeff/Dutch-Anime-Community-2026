export const deepEqual = (a: unknown, b: unknown): boolean => {
	if (a === b) return true;
	if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
	if (Array.isArray(a) !== Array.isArray(b)) return false;
	const keysA = Object.keys(a as object);
	const keysB = Object.keys(b as object);
	if (keysA.length !== keysB.length) return false;
	return keysA.every((key) => deepEqual((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key]));
};

// updateArgs merges shallowly at the top level and deletes keys whose value is undefined, so the
// write-back sends exactly the changed keys (whole) plus removed keys as undefined. Untouched keys
// are never sent — that is what keeps function-valued args (invisible in the editor) intact.
export const diffTopLevel = (
	current: Record<string, unknown>,
	next: Record<string, unknown>,
): Record<string, unknown> => {
	const update: Record<string, unknown> = {};
	for (const key of Object.keys(next)) {
		if (!deepEqual(current[key], next[key])) update[key] = next[key];
	}
	for (const key of Object.keys(current)) {
		if (!(key in next)) update[key] = undefined;
	}
	return update;
};
