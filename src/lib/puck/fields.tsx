import { FieldLabel, type Field } from '@puckeditor/core';
import { z } from 'zod';

import { ICONS } from '@/components/basics/Icon';
import { getBrowserClient } from '@/lib/supabase/client';

// Zod → Puck field mapping. Driven ONLY by schema types and explicit `.meta({ editor })` hints —
// never by field names — so the schema stays the single contract (see the rebuild design doc).

/** Merges registry metadata (title/description/editor) across optional/nullable/default wrappers. */
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

/** Strips optional/nullable/default wrappers down to the underlying schema. */
const unwrap = (schema: z.ZodType): z.ZodType => {
	let current = schema;
	while (current instanceof z.ZodOptional || current instanceof z.ZodNullable || current instanceof z.ZodDefault) {
		current = current.unwrap() as z.ZodType;
	}
	return current;
};

/** 'viewAllUrl' → 'View all url' — a readable label without inventing meaning. Shared with the
 * preset extraction (story export names follow the same camelCase convention). */
export const humanise = (name: string): string => {
	const spaced = name.replace(/([a-z0-9])([A-Z])/g, '$1 $2').toLowerCase();
	return spaced.charAt(0).toUpperCase() + spaced.slice(1);
};

/** First string in an array item, for Puck's item summaries. Ids don't count. */
const itemSummary = (item: Record<string, unknown>, index?: number): string => {
	// Skip values starting with '<' (rich text / HTML) so the summary reads as plain text, not markup.
	const text = Object.entries(item).find(
		([key, value]): boolean =>
			key !== 'id' && typeof value === 'string' && value.length > 0 && !value.startsWith('<'),
	)?.[1] as string | undefined;
	return text ?? `Item ${(index ?? 0) + 1}`;
};

/** A media file under /public, as served by the dev-only /api/builder/images route. */
interface PublicMediaFile {
	/** Web path under the site root, e.g. '/media/demo.png' */
	path: string;
	name: string;
	dir: string;
}

const THUMB_EXTENSIONS = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

/** Picker over the /public folder (Puck's external field), for `.meta({ editor: 'file' })` fields. */
const fileField = (label: string): Field => {
	return {
		type: 'external',
		label,
		placeholder: 'Kies een bestand…',
		showSearch: true,
		fetchList: async ({ query }) => {
			// List the Supabase `media` bucket; each item's `path` is the object's public URL, which
			// becomes Media.src. getImage() returns undefined for remote URLs, so Media renders a plain
			// lazy <img> — no manifest lookup needed.
			const db = getBrowserClient();
			const { data } = await db.storage.from('media').list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
			const files: PublicMediaFile[] = (data ?? [])
				.filter((object) => object.id)
				.map((object) => ({ path: db.storage.from('media').getPublicUrl(object.name).data.publicUrl, name: object.name, dir: 'media' }));
			const needle = query?.toLowerCase() ?? '';
			return needle ? files.filter((file) => file.path.toLowerCase().includes(needle)) : files;
		},
		mapProp: (file: PublicMediaFile) => file.path,
		mapRow: (file: PublicMediaFile) => ({
			'': THUMB_EXTENSIONS.test(file.name) ? (
				<img src={file.path} alt="" className="builder-file-thumb" />
			) : (
				''
			),
			Bestand: file.name,
			Map: file.dir,
		}),
		getItemSummary: (item: PublicMediaFile | string) => (typeof item === 'string' ? item : item.path),
	};
};

/** Editor widget for `z.array(z.string())`: one value per line (Puck arrays require object items). */
const stringListField = (label: string): Field => {
	return {
		type: 'custom',
		label,
		render: ({ onChange, value, readOnly }) => (
			<FieldLabel label={label}>
				<textarea
					className="builder-string-list"
					rows={4}
					disabled={readOnly}
					value={Array.isArray(value) ? value.join('\n') : ''}
					onChange={(event) => {
						const lines = event.currentTarget.value.split('\n').filter((line) => line.trim().length > 0);
						onChange(lines.length ? lines : undefined);
					}}
				/>
			</FieldLabel>
		),
	};
};

/** Fields for every property of an object schema. `id` stays in the data but out of the UI. */
export const objectFieldsFor = (schema: z.ZodObject): Record<string, Field> => {
	const fields: Record<string, Field> = {};
	for (const [key, value] of Object.entries(schema.shape)) {
		if (key === 'id') {
			continue; // ids are machine-managed: generated on insert (defaultValueFor), hidden from editors
		}
		const field = fieldFor(key, value as z.ZodType);
		if (field) {
			fields[key] = field;
		}
	}
	return fields;
};

/** Maps one schema property to a Puck field; undefined = not editable (and that's deliberate). */
export const fieldFor = (name: string, schema: z.ZodType): Field | undefined => {
	const meta = metaOf(schema);
	const inner = unwrap(schema);
	const label = humanise(name);

	if (inner instanceof z.ZodString) {
		if (meta.editor === 'richtext') {
			return { type: 'richtext', label };
		}
		if (meta.editor === 'textarea') {
			return { type: 'textarea', label };
		}
		if (meta.editor === 'icon') {
			return {
				type: 'select',
				label,
				options: [
					{ label: 'Geen icoon', value: '' },
					...Object.keys(ICONS).map((icon) => ({ label: icon, value: icon })),
				],
			};
		}
		if (meta.editor === 'file') {
			return fileField(label);
		}
		return { type: 'text', label };
	}

	if (inner instanceof z.ZodNumber) {
		return {
			type: 'number',
			label,
			...(inner.minValue !== null ? { min: inner.minValue } : {}),
			...(inner.maxValue !== null ? { max: inner.maxValue } : {}),
		};
	}

	if (inner instanceof z.ZodEnum) {
		return {
			type: 'select',
			label,
			options: (inner.options as string[]).map((option) => ({ label: String(option), value: option })),
		};
	}

	if (inner instanceof z.ZodUnion) {
		// Only unions of literals map cleanly (Heading.size 1–6, columns 3|4|5|6); anything else is a
		// modelling problem to fix in the schema, not to paper over here.
		const options = (inner.options as z.ZodType[]).filter((option) => option instanceof z.ZodLiteral);
		if (options.length > 0 && options.length === (inner.options as z.ZodType[]).length) {
			return {
				type: 'select',
				label,
				options: options.map((option) => ({ label: String(option.value), value: option.value as string | number })),
			};
		}
		return undefined;
	}

	if (inner instanceof z.ZodBoolean) {
		return {
			type: 'radio',
			label,
			options: [
				{ label: 'Ja', value: true },
				{ label: 'Nee', value: false },
			],
		};
	}

	if (inner instanceof z.ZodArray) {
		const element = unwrap(inner.element as z.ZodType);
		if (element instanceof z.ZodObject) {
			return {
				type: 'array',
				label,
				arrayFields: objectFieldsFor(element),
				defaultItemProps: () => defaultValueFor(element) as Record<string, unknown>,
				getItemSummary: itemSummary,
			};
		}
		if (element instanceof z.ZodString) {
			return stringListField(label);
		}
		return undefined;
	}

	if (inner instanceof z.ZodObject) {
		return { type: 'object', label, objectFields: objectFieldsFor(inner) };
	}

	// Literals are discriminators, not content; anything unmapped stays out of the editor on purpose.
	return undefined;
};

/** Minimal schema-valid value: required fields get a placeholder, optional ones stay unset. */
export const defaultValueFor = (schema: z.ZodType): unknown => {
	if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
		return undefined;
	}
	const inner = unwrap(schema);

	if (inner instanceof z.ZodString) {
		return 'Tekst';
	}
	if (inner instanceof z.ZodNumber) {
		return inner.minValue ?? 0;
	}
	if (inner instanceof z.ZodEnum) {
		return (inner.options as string[])[0];
	}
	if (inner instanceof z.ZodUnion) {
		const first = (inner.options as z.ZodType[]).find((option) => option instanceof z.ZodLiteral);
		return first ? first.value : undefined;
	}
	if (inner instanceof z.ZodBoolean) {
		return false;
	}
	if (inner instanceof z.ZodArray) {
		return [];
	}
	if (inner instanceof z.ZodObject) {
		const value: Record<string, unknown> = {};
		for (const [key, sub] of Object.entries(inner.shape)) {
			const subValue = key === 'id' ? crypto.randomUUID() : defaultValueFor(sub as z.ZodType);
			if (subValue !== undefined) {
				value[key] = subValue;
			}
		}
		return value;
	}
	if (inner instanceof z.ZodLiteral) {
		return inner.value;
	}
	return undefined;
};
