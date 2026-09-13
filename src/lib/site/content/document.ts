import { z } from 'zod';


import { CookieConsentProps } from '@/components/components/CookieConsent/CookieConsent.schema';
import { ScrollProgressProps } from '@/components/components/ScrollProgress/ScrollProgress.schema';
import { SearchPaletteProps } from '@/components/components/SearchPalette/SearchPalette.schema';
import { Block } from '@/components/contentBlocks/Blocks/Blocks.schema.generated';
import { AnnouncementBarProps } from '@/components/structures/AnnouncementBar/AnnouncementBar.schema';
import { FooterProps } from '@/components/structures/Footer/Footer.schema';
import { NavigationProps } from '@/components/structures/Navigation/Navigation.schema';
import { OgImage } from '@/lib/site/content/shared';

// What content is, assembled from the schema each component keeps next to itself.

export { Block };

// What a page is — the object at the top of every file in src/content/pages. `meta` is everything
// the <head> needs, `blocks` is the body, validated against the one Block union. This is the shape
// `parseContent` checks at build time, so a mismatch here is what stops `next build`.

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

export const SiteStructures = z
	.object({
		announcementBar: AnnouncementBarProps.optional().describe('Optional site-wide announcement banner'),
		navigation: NavigationProps.describe('The site header navigation'),
		footer: FooterProps.describe('The site footer'),
		scrollProgress: ScrollProgressProps.optional().describe('Optional reading-progress bar pinned to the viewport'),
		searchPalette: SearchPaletteProps.optional().describe('Optional Cmd/Ctrl+K command palette'),
		cookieConsent: CookieConsentProps.optional().describe('Optional site-wide cookie consent bar'),
	})
	.meta({ title: 'SiteStructures' });
export type SiteStructures = z.infer<typeof SiteStructures>;
