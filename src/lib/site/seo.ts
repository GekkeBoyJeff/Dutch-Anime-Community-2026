import type { Metadata } from 'next';

import { isStatic } from '@/lib/shared/env';
import { getPageByPath, type ReviewItem, type Block, type OgImage, type StructuredDataNode } from '@/lib/site/content';
import { ogSize } from '@/lib/site/ogImage';
import { site } from '@/lib/site/site';

// One stable @id for the site's Organization: every node that emits one has to point at this entity,
// or search engines read the duplicates as separate companies.
const ORGANIZATION_ID = `${site.url}/#organization`;

const LOGO_URL = new URL('/icon-512.png', site.url).href;

export const ogImageMeta = (path: string, image?: OgImage): Pick<Metadata, 'openGraph'> => {
	if (image) {
		return { openGraph: { images: [image] } };
	}
	// A static host can't run the /api/og route handler, so the page points at a card pre-generated
	// into /public/og/<slug>.png. The url has to stay ABSOLUTE: site.url already carries the project
	// subpath, which basePath + metadataBase would prepend a second time.
	if (isStatic) {
		const slug = path === '/' ? 'home' : path.replace(/^\//, '').replace(/\//g, '-');
		return { openGraph: { images: [{ url: `${site.url}/og/${slug}.png`, width: ogSize.width, height: ogSize.height }] } };
	}
	return {
		openGraph: { images: [{ url: `/api/og?path=${encodeURIComponent(path)}`, width: ogSize.width, height: ogSize.height }] },
	};
}

// The home title is `absolute` so the layout's title template doesn't append the site name twice.
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
			// A named subject is a distinct entity, so it gets no @id and the rating does not attach to
			// the site's Organization. (JSON.stringify drops the undefined key.)
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
				reviewBody: review.value,
			})),
		};
	},

	faqAccordion: ({ items = [] }) => {
		if (!items.length) {
			return null;
		}

		return {
			'@type': 'FAQPage',
			mainEntity: items.map((item) => ({
				'@type': 'Question',
				name: item.title,
				acceptedAnswer: { '@type': 'Answer', text: item.value },
			})),
		};
	},

	// Dateless items are legitimate content but not valid Events — Google requires a startDate — so
	// they are skipped rather than emitted incomplete.
	eventTeaser: ({ events = [] }) =>
		events
			.filter((event) => event.startDate)
			.map((event) => ({
				'@type': 'Event',
				name: event.title,
				startDate: event.startDate,
				endDate: event.endDate || undefined,
				description: event.value || undefined,
				location: event.location ? { '@type': 'Place', name: event.location } : undefined,
				url: event.href || undefined,
			})),
};

export const pageJsonLd = (blocks: Block[], extra: StructuredDataNode[] = []) => {
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
