import { z } from 'zod';

import { Block } from '@/lib/content/schema/blocks';
import { OgImage } from '@/lib/content/schema/primitives';

// A page is a document: a `meta` envelope plus an ordered list of blocks. There is one content type —
// a blog is just pages; a blog overview will be an ordinary page with a future list block.

// A schema.org node merged verbatim into the page's JSON-LD @graph. '@type' is required so a node
// is at least addressable; the rest is open on purpose — structured-data vocabularies are too wide
// to model here, and Google's Rich Results test is the real gate.
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
