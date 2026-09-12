import type { Decorator } from '@storybook/nextjs-vite';
import type { ArgTypesEnhancer } from 'storybook/internal/csf';
import { addons } from 'storybook/preview-api';
import * as z from 'zod';

import { ICONS } from '@/components/basics/Icon/Icon';
import { describeField, describeMeta, type FieldDescription } from '@/lib/shared/schemaFields';

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
		result = {
			storyId: context.id,
			schema: null,
			issues: [],
		};
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
			result = {
				storyId: context.id,
				schema: null,
				issues: [],
				error: e instanceof Error ? e.message : String(e),
			};
		}
	}

	lastResultByStory.set(context.id, result);
	channel.emit(EVENTS.RESULT, result);
	return StoryFn();
};

// A prop type that is `z.infer<…>` reaches docgen as a plain alias: every description is blank and
// nothing is marked required. The zod schema's `.describe()` and `required` array fill both in.
type Control = { control: { type: string; min?: number; max?: number }; options?: (string | number)[] };

/** Which Storybook control shows a field description best; undefined = let Storybook guess. */
const controlFor = (field: FieldDescription): Control | undefined => {
	switch (field.kind) {
		case 'text':
		case 'textarea':
		case 'richtext':
			return { control: { type: 'text' } };
		case 'number':
			return field.min !== undefined && field.max !== undefined
				? { control: {
					type: 'range',
					min: field.min,
					max: field.max,
				} }
				: { control: { type: 'number' } };
		case 'choice':
			// All but one enum in this codebase has six options or fewer, and those read best as
			// radios you can see at once. Only a genuinely long list earns a dropdown.
			return { control: { type: field.options.length > 7 ? 'select' : 'inline-radio' }, options: field.options };
		case 'boolean':
			return { control: { type: 'boolean' } };
		case 'icon':
			// The same picker Puck offers, from the same map — an icon name should never be a free
			// text field in one tool and a dropdown in the other.
			return { control: { type: 'select' }, options: Object.keys(ICONS) };
		case 'textList':
		case 'objectList':
		case 'object':
			// Storybook's object control is a JSON editor, which is the only sensible input for a
			// list or a nested shape.
			return { control: { type: 'object' } };
		default:
			// Only `file` is left: its picker reads the Supabase media bucket, which Storybook has no
			// access to, so the story decides.
			return undefined;
	}
};

/** `argType.type` is either a bare name like 'string' or a full object; `required` only fits the object. */
const asTypeObject = (type: unknown): Record<string, unknown> => {
	if (typeof type === 'string') return { name: type };
	if (type && typeof type === 'object') return type as Record<string, unknown>;
	return { name: 'other', value: 'unknown' };
};

// Storybook already knows which props exist; the schema knows what they mean. This fills in what the
// story left unsaid — the description, whether the prop is required, and which control fits. Anything
// a story writes by hand wins, so narrowing a control on purpose keeps working.
export const withJsonSchemaArgTypes: ArgTypesEnhancer = (context) => {
	const argTypes = context.argTypes ?? {};
	const schema: unknown = context.parameters[PARAM_KEY]?.schema;
	if (!(schema instanceof z.ZodObject)) return argTypes;

	const enhanced: Record<string, Record<string, unknown>> = { ...argTypes };

	for (const [name, property] of Object.entries(schema.shape)) {
		const meta = describeMeta(name, property as z.ZodType);
		const field = describeField(name, property as z.ZodType);
		const current = enhanced[name] ?? {};

		enhanced[name] = {
			...current,
			// react-docgen hands back `description: ''` for a prop it could not read through the
			// `z.infer` alias, so `??` would take that empty string for an answer.
			description: typeof current.description === 'string' && current.description.length > 0 ? current.description : meta.description,
			...(meta.required ? { type: { ...asTypeObject(current.type), required: true } } : {}),
			// A property with no control — a handler, a React node, a mixed union — still deserves
			// its description and its required marker, so only the control is conditional.
			...(field && current.control === undefined ? controlFor(field) : {}),
		};
	}

	return enhanced as typeof argTypes;
};
