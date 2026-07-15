import type { Metadata } from 'next';

import { getPageByPath, type ReviewItem, type Block, type OgImage, type StructuredDataNode } from '@/lib/content';
import { isStatic } from '@/lib/env';
import { ogSize } from '@/lib/ogImage';
import { site } from '@/lib/site';

// Stable @id for the site's Organization node, so every place that emits an Organization (the layout's
// site-wide node, the reviews aggregateRating, an article's publisher) refers to ONE entity instead of
// minting duplicate, unlinked Organizations that search engines may read as separate companies.
const ORGANIZATION_ID = `${site.url}/#organization`;

// Absolute URL to the brand logo for structured data (Google requires a logo for the Organization/logo
// rich result). Reuses the 512px PWA icon already in /public.
const LOGO_URL = new URL('/icon-512.png', site.url).href;


// Builds the openGraph.images fragment for a route. A bespoke content `meta.image` wins; otherwise the
// page points at the generated card route (/api/og?path=…), which renders THIS page's title — so a page
// no longer shares the site-wide opengraph-image. The url is root-relative; Next resolves it against
// metadataBase. One helper, spread into every route's generateMetadata, so the rule lives in one place.
export const ogImageMeta = (path: string, image?: OgImage): Pick<Metadata, 'openGraph'> => {
	if (image) {
		return { openGraph: { images: [image] } };
	}
	// On a static host the /api/og route handler can't run, so each page points at a
	// PRE-GENERATED card committed at /public/og/<slug>.png (regenerate via the /api/og route — see the
	// "SEO & sharing" guide). An ABSOLUTE url (site.url already includes the project subpath) sidesteps
	// the basePath + metadataBase rewrite that would otherwise double the subpath.
	if (isStatic) {
		const slug = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
		return { openGraph: { images: [{ url: `${site.url}/og/${slug}.png`, width: ogSize.width, height: ogSize.height }] } };
	}
	// On a server, render the card fresh per request from the page's own title.
	return {
		openGraph: { images: [{ url: `/api/og?path=${encodeURIComponent(path)}`, width: ogSize.width, height: ogSize.height }] },
	};
}

// Full page metadata for a content route. The home title is `absolute` so the layout's title template
// doesn't append the site name twice; other pages keep the template. Both the home route (app/page.tsx)
// and the catch-all (app/[...slug]) call this, so a route's metadata is defined once, not per file.
export const pageMetadata = async (path: string): Promise<Metadata> => {
	const page = await getPageByPath(path);
	if (!page) {
		return {};
	}

	return {
		title: path === '/' ? { absolute: page.meta.title } : page.meta.title,
		description: page.meta.description,
		alternates: { canonical: path },
		...ogImageMeta(path, page.meta.image),
	};
}

// JSON-LD builders (schema.org). They return plain objects; the page serializes them inside a
// <script type="application/ld+json">. Helps search engines read the site/posts as rich results.
export const organizationJsonLd = () => {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		'@id': ORGANIZATION_ID,
		name: site.name,
		url: site.url,
		description: site.description,
		logo: LOGO_URL,
	};
}

const averageRating = (items: ReviewItem[]): number => {
	const total = items.reduce((sum, review) => sum + review.rating, 0);
	return Math.round((total / items.length) * 10) / 10;
}

// One builder per block type that returns its schema.org fragment. Mirrors the Blocks render
// registry: a block that has structured data declares it here.
const BLOCK_BUILDERS: {
	[B in Block as B['type']]?: (block: Extract<Block, { type: B['type'] }>) => unknown;
} = {
	// Review/AggregateRating must be nested in a reviewable item, otherwise Google rejects the
	// rich snippet — hence the enclosing Organization.
	reviews: ({ subject, items = [] }) => {
		if (!items.length) {
			return null;
		}

		return {
			'@type': 'Organization',
			// When the reviews are about the site itself (no explicit subject), link to the canonical
			// Organization node so the rating attaches to it rather than a duplicate. A named subject is
			// a distinct entity and gets no @id. (undefined keys are dropped by JSON.stringify.)
			'@id': subject ? undefined : ORGANIZATION_ID,
			name: subject ?? site.name,
			aggregateRating: {
				'@type': 'AggregateRating',
				ratingValue: averageRating(items),
				reviewCount: items.length,
				bestRating: 5,
			},
			review: items.map((review) => ({
				'@type': 'Review',
				author: { '@type': 'Person', name: review.author },
				reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
				reviewBody: review.body,
			})),
		};
	},

	// FAQ rich result derived from the block's own items — the questions live once, in the block,
	// so the structured data can never drift from what the page shows.
	faqAccordion: ({ items = [] }) => {
		if (!items.length) {
			return null;
		}

		return {
			'@type': 'FAQPage',
			mainEntity: items.map((item) => ({
				'@type': 'Question',
				name: item.question,
				acceptedAnswer: { '@type': 'Answer', text: item.answer },
			})),
		};
	},

	// Event nodes for teaser items that carry a start date (Google requires one; `startDate` should
	// be ISO-formatted). Items without a date are legitimate content but not valid Events — skipped.
	eventTeaser: ({ events = [] }) =>
		events
			.filter((event) => event.startDate)
			.map((event) => ({
				'@type': 'Event',
				name: event.title,
				startDate: event.startDate,
				endDate: event.endDate || undefined,
				description: event.summary || undefined,
				location: event.location ? { '@type': 'Place', name: event.location } : undefined,
				url: event.href || undefined,
			})),
};

// Collects the structured data of all blocks — plus any bespoke meta.structuredData nodes — into
// one @graph: Google's preference and dedup-free. A builder may return one node or an array of
// nodes (eventTeaser). Returns null when nothing contributes, so the page renders no empty script.
export const pageJsonLd = (blocks: Block[] = [], extra: StructuredDataNode[] = []) => {
	const graph = [
		// `as never` resolves the discriminated-union correlation: each builder takes its own variant.
		...blocks.flatMap((block) => {
			const node = BLOCK_BUILDERS[block.type]?.(block as never);
			return node ? (Array.isArray(node) ? node : [node]) : [];
		}),
		...extra,
	];

	if (!graph.length) {
		return null;
	}

	return { '@context': 'https://schema.org', '@graph': graph };
}
