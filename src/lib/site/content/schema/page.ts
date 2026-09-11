import { z } from 'zod';

// What a page is — the object at the top of every file in src/content/pages. `meta` is everything
// the <head> needs, `blocks` is the body, validated against the one Block union. This is the shape
// `parseContent` checks at build time, so a mismatch here is what stops `next build`.

import { Block } from '@/lib/site/content/schema/blocks';
import { OgImage } from '@/lib/site/content/schema/shared';

// Open on purpose: structured-data vocabularies are too wide to model, and Google's Rich Results
// test is the real gate. Only '@type' is required, so a node is at least addressable.
export const StructuredDataNode = z
	.object({ '@type': z.string().min(1) })
	.catchall(z.unknown())
	.meta({ title: 'StructuredDataNode' });
export type StructuredDataNode = z.infer<typeof StructuredDataNode>;

export const PageMeta = z.object({
	title: z.string().min(1),
	description: z.string().min(1).meta({ editor: 'textarea' }),
	image: OgImage.optional(),
	structuredData: z
		.array(StructuredDataNode)
		.optional()
		.describe('Extra schema.org nodes merged into the page\'s JSON-LD @graph (see lib/seo.ts pageJsonLd)'),
});
export type PageMeta = z.infer<typeof PageMeta>;

export const Page = z.object({
	meta: PageMeta,
	blocks: z.array(Block),
});
export type Page = z.infer<typeof Page>;
