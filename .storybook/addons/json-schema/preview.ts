import type { Decorator } from '@storybook/nextjs-vite';
import type { ArgTypesEnhancer } from 'storybook/internal/csf';
import { addons } from 'storybook/preview-api';
import * as z from 'zod';

import { EVENTS, PARAM_KEY, type SchemaResult } from './constants';

// HMR creates fresh schema instances, so stale entries fall out of the WeakMap without invalidation.
const jsonSchemaCache = new WeakMap<z.ZodType, Record<string, unknown>>();

// The manager can subscribe after the first RESULT was emitted (the channel has no replay), so the
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
		// io:'input' keeps defaulted fields out of `required`; unrepresentable:'any' emits {} instead of
		// throwing on z.date() and friends.
		json = z.toJSONSchema(schema, { io: 'input', unrepresentable: 'any' }) as Record<string, unknown>;
		jsonSchemaCache.set(schema, json);
	}
	return json;
};

export const withJsonSchema: Decorator = (StoryFn, context) => {
	const schema: z.ZodType | undefined = context.parameters[PARAM_KEY]?.schema;

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

// A prop type that is `z.infer<…>` reaches docgen as a plain alias: every description is blank and
// nothing is marked required. The zod schema's `.describe()` and `required` array fill both in.
export const withJsonSchemaArgTypes: ArgTypesEnhancer = (context) => {
	const argTypes = context.argTypes ?? {};
	const schema: z.ZodType | undefined = context.parameters[PARAM_KEY]?.schema;
	if (!schema) return argTypes;

	let json: Record<string, unknown>;
	try {
		json = convert(schema);
	} catch {
		return argTypes;
	}

	const properties = json.properties as Record<string, { description?: unknown }> | undefined;
	if (!properties) return argTypes;

	const required = new Set(Array.isArray(json.required) ? (json.required as string[]) : []);

	return Object.fromEntries(
		Object.entries(argTypes).map(([name, argType]) => {
			const description = properties[name]?.description;
			const enhanced = { ...argType };
			if (!enhanced.description && typeof description === 'string') enhanced.description = description;
			if (required.has(name)) {
				enhanced.type = { ...(enhanced.type ?? { name: 'other', value: 'unknown' }), required: true };
				enhanced.table = { ...enhanced.table, type: { ...enhanced.table?.type, required: true } };
			}
			return [name, enhanced];
		}),
	);
};
