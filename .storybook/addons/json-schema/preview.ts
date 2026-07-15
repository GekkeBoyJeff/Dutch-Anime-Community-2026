import type { Decorator } from '@storybook/nextjs-vite';
import type { ArgTypesEnhancer } from 'storybook/internal/csf';
import { addons } from 'storybook/preview-api';
import * as z from 'zod';

import { EVENTS, PARAM_KEY, type SchemaResult } from './constants';

// Conversion is cheap (~0.04 ms) but returns a new object per call; the cache gives referential
// stability. HMR creates fresh schema instances, so stale entries fall out of the WeakMap naturally.
const jsonSchemaCache = new WeakMap<z.ZodType, Record<string, unknown>>();

// The manager can subscribe after the first RESULT was emitted (channel has no replay), so the
// preview answers REQUEST events from this cache.
const lastResultByStory = new Map<string, SchemaResult>();

const channel = addons.getChannel();
channel.on(EVENTS.REQUEST, ({ storyId }: { storyId: string }) => {
	const cached = lastResultByStory.get(storyId);
	if (cached) channel.emit(EVENTS.RESULT, cached);
});

const convert = (schema: z.ZodType): Record<string, unknown> => {
	let json = jsonSchemaCache.get(schema);
	if (!json) {
		// io:'input' documents what a story author may pass (defaulted fields leave `required`);
		// unrepresentable:'any' emits {} instead of throwing on z.date() and friends.
		json = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }) as Record<string, unknown>;
		jsonSchemaCache.set(schema, json);
	}
	return json;
};

export const withJsonSchema: Decorator = (StoryFn, context) => {
	const raw = context.parameters[PARAM_KEY]?.schema;
	// Thunk form is the escape hatch that keeps zod internals out of the serialized parameters.
	const schema: z.ZodType | undefined = typeof raw === 'function' ? raw() : raw;

	let result: SchemaResult;
	if (!schema) {
		result = { storyId: context.id, schema: null, issues: [] };
	} else {
		try {
			const parsed = schema.safeParse(context.args);
			result = {
				storyId: context.id,
				schema: convert(schema),
				issues: parsed.success
					? []
					: parsed.error.issues.map(({ code, path, message }) => ({
							code,
							// zod types path as PropertyKey[]; symbols can't be rendered or serialized.
							path: path.map((p) => (typeof p === 'symbol' ? String(p) : p)),
							message,
						})),
			};
		} catch (e) {
			result = { storyId: context.id, schema: null, issues: [], error: e instanceof Error ? e.message : String(e) };
		}
	}

	lastResultByStory.set(context.id, result);
	channel.emit(EVENTS.RESULT, result);
	return StoryFn();
};

// One .describe() in the zod schema feeds both the JSON Schema panel and this props-table description;
// without it the docgen table shows blank descriptions for zod-inferred prop types.
export const withJsonSchemaArgTypes: ArgTypesEnhancer = (context) => {
	const argTypes = context.argTypes ?? {};
	const raw = context.parameters[PARAM_KEY]?.schema;
	const schema: z.ZodType | undefined = typeof raw === 'function' ? raw() : raw;
	if (!schema) return argTypes;

	let json: Record<string, unknown>;
	try {
		json = convert(schema);
	} catch {
		return argTypes;
	}

	const properties = json.properties as Record<string, { description?: unknown }> | undefined;
	if (!properties) return argTypes;

	return Object.fromEntries(
		Object.entries(argTypes).map(([name, argType]) => {
			const description = properties[name]?.description;
			return !argType.description && typeof description === 'string' ? [name, { ...argType, description }] : [name, argType];
		}),
	);
};
