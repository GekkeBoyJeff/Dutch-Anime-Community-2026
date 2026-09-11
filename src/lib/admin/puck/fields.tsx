import { FieldLabel, type Field } from '@puckeditor/core';
import { z } from 'zod';

import { ICONS } from '@/components/basics/Icon';
import { authoredBound, describeField, unwrap, type FieldDescription } from '@/lib/shared/schemaFields';
import { getBrowserClient } from '@/lib/shared/supabase/client';

// describeField() decides what kind of input a property wants; this file only says what that looks
// like in Puck. The Storybook controls panel renders the same descriptions its own way.

const itemSummary = (item: Record<string, unknown>, index?: number): string => {
	// Values starting with '<' are rich text; the summary must read as plain text, not markup.
	const text = Object.entries(item).find(
		([key, value]): boolean =>
			key !== 'id' && typeof value === 'string' && value.length > 0 && !value.startsWith('<'),
	)?.[1] as string | undefined;
	return text ?? `Item ${(index ?? 0) + 1}`;
};

interface PublicMediaFile {
	path: string;
	name: string;
}

const THUMB_EXTENSIONS = /\.(png|jpe?g|webp|avif|gif|svg)$/i;

const fileField = (label: string): Field => {
	return {
		type: 'external',
		label,
		placeholder: 'Kies een bestand…',
		showSearch: true,
		fetchList: async ({ query }) => {
			// `path` is the object's public URL: getImage() returns undefined for a remote src, so
			// Media renders a plain lazy <img> instead of looking it up in the manifest.
			const db = getBrowserClient();
			const { data } = await db.storage.from('media').list('', { limit: 1000, sortBy: { column: 'created_at', order: 'desc' } });
			const files: PublicMediaFile[] = (data ?? [])
				.filter((object) => object.id)
				.map((object) => ({ path: db.storage.from('media').getPublicUrl(object.name).data.publicUrl, name: object.name }));
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
			Map: 'media',
		}),
		getItemSummary: (item: PublicMediaFile | string) => (typeof item === 'string' ? item : item.path),
	};
};

// Puck's array field only takes object items, so a list of plain strings needs its own widget.
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

const iconField = (label: string): Field => {
	return {
		type: 'select',
		label,
		options: [{ label: 'Geen icoon', value: '' }, ...Object.keys(ICONS).map((icon) => ({ label: icon, value: icon }))],
	};
};

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

/** Renders one field description as a Puck field. */
const puckField = (field: FieldDescription): Field => {
	const { label } = field;

	switch (field.kind) {
		case 'richtext':
			return { type: 'richtext', label };
		case 'textarea':
			return { type: 'textarea', label };
		case 'icon':
			return iconField(label);
		case 'file':
			return fileField(label);
		case 'text':
			return { type: 'text', label };
		case 'number':
			return {
				type: 'number',
				label,
				...(field.min !== undefined ? { min: field.min } : {}),
				...(field.max !== undefined ? { max: field.max } : {}),
			};
		case 'choice':
			return { type: 'select', label, options: field.options.map((option) => ({ label: String(option), value: option })) };
		case 'boolean':
			return {
				type: 'radio',
				label,
				options: [
					{ label: 'Ja', value: true },
					{ label: 'Nee', value: false },
				],
			};
		case 'textList':
			return stringListField(label);
		case 'objectList':
			return {
				type: 'array',
				label,
				arrayFields: objectFieldsFor(field.shape),
				defaultItemProps: () => defaultValueFor(field.shape) as Record<string, unknown>,
				getItemSummary: itemSummary,
			};
		case 'object':
			return { type: 'object', label, objectFields: objectFieldsFor(field.shape) };
	}
};

/** Maps one schema property to a Puck field; undefined = not editable (and that's deliberate). */
export const fieldFor = (name: string, schema: z.ZodType): Field | undefined => {
	const field = describeField(name, schema);
	return field ? puckField(field) : undefined;
};

export const defaultValueFor = (schema: z.ZodType): unknown => {
	if (schema instanceof z.ZodOptional || schema instanceof z.ZodNullable) {
		return undefined;
	}
	const inner = unwrap(schema);

	if (inner instanceof z.ZodString) {
		return 'Tekst';
	}
	if (inner instanceof z.ZodNumber) {
		return authoredBound(inner.minValue) ?? 0;
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
