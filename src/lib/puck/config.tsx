import type { Config, Field } from '@puckeditor/core';
import { useEffect, useRef } from 'react';
import type { z } from 'zod';

import { REGISTRY } from '@/components/contentBlocks/Blocks';
import SiteChrome from '@/components/structures/SiteChrome';
import { Block, PageMeta, SiteStructures } from '@/lib/content/schema';
import { defaultValueFor, fieldFor, objectFieldsFor } from '@/lib/puck/fields';
import { defaultPresetFor } from '@/lib/puck/presets';
import type { BuilderRootProps } from '@/lib/puck/transform';

// The Puck config, generated from the SAME Zod schemas and render registry the site uses — the
// editor cannot drift from the contract because it declares nothing of its own.

const componentEntries = (): Config['components'] => {
	return Object.fromEntries(
		Block.options.flatMap((blockSchema) => {
			const type = blockSchema.shape.type.value as keyof typeof REGISTRY;
			const Renderer = REGISTRY[type];
			if (!Renderer) {
				return [];
			}

			// `type` is the discriminator and `id` is Puck's own instance key — neither is a field.
			const shape = Object.entries(blockSchema.shape).filter(([key]) => key !== 'type' && key !== 'id');
			const fields = Object.fromEntries(
				shape.flatMap(([key, schema]) => {
					const field = fieldFor(key, schema as never);
					return field ? [[key, field] as const] : [];
				}),
			);
			// A fresh block starts with its Default story's data (real, curated mock content); blocks
			// without stories fall back to minimal schema-valid values.
			const defaultProps =
				defaultPresetFor(type) ??
				Object.fromEntries(
					shape.flatMap(([key, schema]) => {
						const value = defaultValueFor(schema as never);
						return value !== undefined ? [[key, value] as const] : [];
					}),
				);

			return [
				[
					type,
					{
						fields,
						defaultProps,
						// Strip Puck's injected editor props before spreading, mirroring Blocks.tsx.
						render: ({ puck: _puck, id: _id, ...props }: Record<string, unknown>) => {
							const Component = Renderer as React.ComponentType<typeof props>;
							return <Component {...props} />;
						},
					},
				] as const,
			];
		}),
	);
};

// The real site sets data-theme/data-colorset on <html>/<body> (root layout); Puck's preview iframe
// has its own document without them, which would break the token cascade. This invisible marker
// finds the iframe document through its own ref and restores both attributes.
const PreviewTheme = () => {
	const ref = useRef<HTMLSpanElement>(null);

	// Deliberately no dependency array: Puck can swap the iframe document underneath us (viewport
	// switches recreate the frame), so this idempotent guard re-applies after every render.
	useEffect(() => {
		const doc = ref.current?.ownerDocument;
		if (doc && doc !== document) {
			doc.documentElement.dataset.theme ??= 'default';
			doc.body.dataset.colorset ??= 'light';
		}
	});

	return <span ref={ref} hidden />;
};

// Root props are object schemas, so fieldFor always maps them; the throw guards the invariant at
// config-build time instead of silently dropping an editor section.
const requiredField = (name: string, schema: z.ZodType): Field => {
	const field = fieldFor(name, schema);
	if (!field) {
		throw new Error(`No editor field could be derived for root prop "${name}"`);
	}
	return field;
};

export const config: Config = {
	components: componentEntries(),
	categories: {
		headers: {
			title: 'Koppen & titels',
			components: ['hero', 'ctaBanner', 'titleText'],
			defaultExpanded: true,
		},
		content: {
			title: 'Content',
			components: ['prose', 'textMedia', 'steps', 'faqAccordion'],
		},
		grids: {
			title: 'Grids & kaarten',
			components: ['bentoGrid', 'highlightCards', 'featureCards', 'introGrid', 'articleCardGrid', 'eventCardGrid', 'profileCards', 'linkCardGrid'],
		},
		marketing: {
			title: 'Marketing & social',
			components: ['reviews', 'logoCloud', 'eventTeaser', 'subscribeNewsletter'],
		},
		other: {
			title: 'Overig',
		},
	},
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
		// The preview mirrors the real page's frame exactly: .page-frame > .page-frame-scroll > SiteChrome
		// > <main> (same nesting as the (website) layout + PageView), so the canvas is what the live,
		// framed site renders. This render is preview-only — published pages render via PageView/Blocks.
		render: (props: Record<string, unknown>) => {
			const { children, announcementBar, navigation, footer } = props as React.PropsWithChildren<BuilderRootProps>;

			return (
				<>
					<PreviewTheme />
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
