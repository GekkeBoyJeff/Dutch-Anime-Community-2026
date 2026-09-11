import { z } from 'zod';

// One schema property, one question: what kind of input does it want? The visual editor and the
// Storybook controls panel both need that answer, so neither of them reads a Zod type directly —
// they call describeField() and render what it says. Add a kind here and both learn it at once.

export type FieldKind =
	| 'text'
	| 'textarea'
	| 'richtext'
	| 'icon'
	| 'file'
	| 'number'
	| 'choice'
	| 'boolean'
	| 'textList'
	| 'objectList'
	| 'object';

export type FieldMeta = {
	/** The property name as a reader would say it: `startDate` → `Start date`. */
	label: string;
	/** Whatever `.describe()` put on the property. */
	description?: string;
	/** False when the property is optional, nullable or has a default. */
	required: boolean;
};

/**
 * A discriminated union, so `switch (field.kind)` tells TypeScript which extras exist: only a
 * `choice` has options, only a `number` has min/max, only the two nested kinds carry a shape.
 */
export type FieldDescription =
	| (FieldMeta & { kind: 'text' | 'textarea' | 'richtext' | 'icon' | 'file' | 'boolean' | 'textList' })
	| (FieldMeta & { kind: 'number'; min?: number; max?: number })
	| (FieldMeta & { kind: 'choice'; options: (string | number)[] })
	| (FieldMeta & { kind: 'objectList' | 'object'; shape: z.ZodObject });

/** `.meta()` lives on the wrapper a `.optional()` returns, so collect it on the way down. */
const metaOf = (schema: z.ZodType): Record<string, unknown> => {
	let merged: Record<string, unknown> = {};
	let current: z.ZodType | undefined = schema;
	while (current) {
		merged = { ...current.meta(), ...merged };
		current =
			current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault
				? (current.unwrap() as z.ZodType)
				: undefined;
	}
	return merged;
};

/** Peels `.optional()`, `.nullable()` and `.default()` off until the real type is left. */
export const unwrap = (schema: z.ZodType): z.ZodType => {
	let current = schema;
	while (current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault) {
		current = current.unwrap() as z.ZodType;
	}
	return current;
};

export const humanise = (name: string): string => {
	const spaced = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** Which of the string kinds `.meta({ editor })` asked for; plain text when it asked for nothing. */
const stringKind = (editor: unknown): 'text' | 'textarea' | 'richtext' | 'icon' | 'file' => {
	switch (editor) {
		case 'richtext':
			return 'richtext';
		case 'textarea':
			return 'textarea';
		case 'icon':
			return 'icon';
		case 'file':
			return 'file';
		default:
			return 'text';
	}
};

// Zod 4 never reports "no bound" as null: an unconstrained number reads ±Infinity, and `.int()`
// quietly injects ±Number.MAX_SAFE_INTEGER. Neither is a bound a person wrote, and passing either on
// gives the editor a slider spanning nine quadrillion values.
export const authoredBound = (value: number | null): number | undefined =>
	value !== null && Number.isFinite(value) && Math.abs(value) !== Number.MAX_SAFE_INTEGER ? value : undefined;

/** The parts every property has, control or not: how to label it, what it means, is it required. */
export const describeMeta = (name: string, schema: z.ZodType): FieldMeta => ({
	label: humanise(name),
	description: typeof metaOf(schema).description === 'string' ? (metaOf(schema).description as string) : undefined,
	required: !(schema instanceof z.ZodOptional || schema instanceof z.ZodNullable || schema instanceof z.ZodDefault),
});

/** undefined = no single input fits this property, so nothing should try to render one. */
export const describeField = (name: string, schema: z.ZodType): FieldDescription | undefined => {
	const meta = metaOf(schema);
	const inner = unwrap(schema);

	const base = describeMeta(name, schema);

	if (inner instanceof z.ZodString) {
		return { ...base, kind: stringKind(meta.editor) };
	}

	if (inner instanceof z.ZodNumber) {
		const min = authoredBound(inner.minValue);
		const max = authoredBound(inner.maxValue);
		return { ...base, kind: 'number', ...(min !== undefined ? { min } : {}), ...(max !== undefined ? { max } : {}) };
	}

	if (inner instanceof z.ZodEnum) {
		return { ...base, kind: 'choice', options: inner.options as string[] };
	}

	if (inner instanceof z.ZodUnion) {
		// A union of literals is a list to pick from; a union of anything else has no one input.
		const members = inner.options as z.ZodType[];
		const literals = members.filter((member) => member instanceof z.ZodLiteral);
		if (literals.length === 0 || literals.length !== members.length) {
			return undefined;
		}
		return { ...base, kind: 'choice', options: literals.map((literal) => literal.value as string | number) };
	}

	if (inner instanceof z.ZodBoolean) {
		return { ...base, kind: 'boolean' };
	}

	if (inner instanceof z.ZodArray) {
		const element = unwrap(inner.element as z.ZodType);
		if (element instanceof z.ZodObject) {
			return { ...base, kind: 'objectList', shape: element };
		}
		if (element instanceof z.ZodString) {
			return { ...base, kind: 'textList' };
		}
		return undefined;
	}

	if (inner instanceof z.ZodObject) {
		return { ...base, kind: 'object', shape: inner };
	}

	return undefined;
};
