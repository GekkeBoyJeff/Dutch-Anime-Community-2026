import type { Config, Field } from '@puckeditor/core';
import { useEffect, useRef } from 'react';
import { z } from 'zod';

import { REGISTRY } from '@/components/contentBlocks/Blocks/Blocks';
import { CARD_GRID_ITEM_BY_VARIANT } from '@/components/contentBlocks/CardGrid/CardGrid.schema';
import SiteChrome from '@/components/structures/SiteChrome/SiteChrome';
import { defaultValueFor, fieldFor, objectFieldsFor } from '@/lib/admin/puck/fields';
import { defaultPresetFor } from '@/lib/admin/puck/presets';
import type { BuilderRootProps } from '@/lib/admin/puck/transform';
import { Block, PageMeta, SiteStructures } from '@/lib/site/content/document';

const componentEntries = (): Config['components'] => {
	return Object.fromEntries(
		Block.options.map((blockSchema) => {
			const type = blockSchema.shape.type.value as keyof typeof REGISTRY;
			const Renderer = REGISTRY[type];

			// `type` is the discriminator and `id` is Puck's own instance key — neither is a field.
			const shape = Object.entries(blockSchema.shape).filter(([key]) => key !== 'type' && key !== 'id');
			const fields = Object.fromEntries(
				shape.flatMap(([key, schema]) => {
					const field = fieldFor(key, schema as never);
					return field ? [[key, field] as const] : [];
				}),
			);
			const defaultProps =
				defaultPresetFor(type) ??
				Object.fromEntries(
					shape.flatMap(([key, schema]) => {
						const value = defaultValueFor(schema as never);
						return value !== undefined ? [[key, value] as const] : [];
					}),
				);

			// A card grid item stores every variant's fields; an author may only see the ones their
			// chosen card actually renders, so the `items` field is reshaped per variant.
			const resolveFields =
				type === 'cardGrid'
					? (data: { props: Record<string, unknown> }): Record<string, Field> => {
							const variant = data.props.variant as keyof typeof CARD_GRID_ITEM_BY_VARIANT;
							const items = fieldFor('items', z.array(CARD_GRID_ITEM_BY_VARIANT[variant] ?? CARD_GRID_ITEM_BY_VARIANT.article));
							return items ? { ...fields, items } : fields;
						}
					: undefined;

			return [
				type,
				{
					fields,
					defaultProps,
					...(resolveFields ? { resolveFields } : {}),
					// Strip Puck's injected editor props before spreading, mirroring Blocks.tsx.
					render: ({ puck: _puck, id: _id, ...props }: Record<string, unknown>) => {
						const Component = Renderer as React.ComponentType<typeof props>;
						return <Component {...props} />;
					},
				},
			] as const;
		}),
	);
};

// Puck's preview iframe has its own document, without the data-colorset the root layout sets on the
// real site — so the token cascade breaks. This invisible marker reaches the iframe document through
// its own ref and restores it.
const PreviewColorset = () => {
	const ref = useRef<HTMLSpanElement>(null);

	// Deliberately no dependency array: Puck can swap the iframe document underneath us (viewport
	// switches recreate the frame), so this idempotent guard re-applies after every render.
	useEffect(() => {
		const doc = ref.current?.ownerDocument;
		if (doc && doc !== document) {
			doc.body.dataset.colorset ??= 'white';
		}
	});

	return <span ref={ref} hidden />;
};

const requiredField = (name: string, schema: z.ZodType): Field => {
	const field = fieldFor(name, schema);
	if (!field) {
		throw new Error(`No editor field could be derived for root prop "${name}"`);
	}
	return field;
};

// The drawer's groups. Each block names its own category in its schema's `.meta()`, so adding one
// never touches this file; these are only the Dutch labels and the order they read in.
const CATEGORY_LABELS = {
	headers: 'Koppen & titels',
	content: 'Content',
	grids: 'Grids & kaarten',
	marketing: 'Marketing & social',
	other: 'Overig',
} as const;

type CategoryName = keyof typeof CATEGORY_LABELS;

const blockCategories = (): Config['categories'] => {
	const byCategory = new Map<CategoryName, string[]>();
	for (const blockSchema of Block.options) {
		const name = (blockSchema.meta()?.category ?? 'other') as CategoryName;
		const category = name in CATEGORY_LABELS ? name : 'other';
		byCategory.set(category, [...(byCategory.get(category) ?? []), blockSchema.shape.type.value as string]);
	}

	return Object.fromEntries(
		Object.entries(CATEGORY_LABELS).map(([name, title]) => [
			name,
			{
				title,
				components: byCategory.get(name as CategoryName) ?? [],
				...(name === 'headers' ? { defaultExpanded: true } : {}),
			},
		]),
	);
};

export const config: Config = {
	components: componentEntries(),
	categories: blockCategories(),
	root: {
		fields: {
			title: { type: 'text', label: 'Meta titel' },
			description: { type: 'textarea', label: 'Meta beschrijving' },
			image: requiredField('image', PageMeta.shape.image),
			structuredData: { type: 'textarea', label: 'Extra JSON-LD (optioneel; array van schema.org nodes)' },
			announcementBar: requiredField('announcementBar', SiteStructures.shape.announcementBar),
			navigation: requiredField('navigation', SiteStructures.shape.navigation),
			footer: requiredField('footer', SiteStructures.shape.footer),
		},
		// Preview only — published pages render via PageView/Blocks. The nesting below must keep
		// mirroring the (website) layout + PageView, or the canvas stops matching the live site.
		render: (props: Record<string, unknown>) => {
			const { children, announcementBar, navigation, footer } = props as React.PropsWithChildren<BuilderRootProps>;

			return (
				<>
					<PreviewColorset />
					<div className="page-frame">
						<div className="page-frame-scroll">
							<SiteChrome
								structures={{
									announcementBar: announcementBar?.message ? announcementBar : undefined,
									navigation: navigation ?? {},
									footer: footer ?? {},
								}}
							>
								<main>{children}</main>
							</SiteChrome>
						</div>
					</div>
				</>
			);
		},
	},
};
