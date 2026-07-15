import { ImageResponse } from 'next/og';

import { getPageByPath } from '@/lib/content';
import { OgCard, ogSize } from '@/lib/ogImage';
import { site } from '@/lib/site';

// Per-page Open Graph card. Each route points openGraph.images at /api/og?path=<path> (see lib/seo →
// ogImageMeta), so every page gets a share card showing its OWN title instead of sharing the site-wide
// opengraph-image. A single route handler serves every path (home + the [...slug] catch-all), so the
// generator and its wiring live in one place. It renders the same OgCard as the site-wide default.
export const GET = async (request: Request) => {
	const path = new URL(request.url).searchParams.get('path') ?? '/';
	const page = await getPageByPath(path);

	// Unknown path → fall back to the site card. The raw query is never drawn into the image, so a
	// crafted ?path= can't inject arbitrary text into a card we serve under our own origin.
	const title = page?.meta.title ?? site.name;
	const description = page?.meta.description ?? site.description;

	return new ImageResponse(<OgCard title={title} description={description} />, ogSize);
};
