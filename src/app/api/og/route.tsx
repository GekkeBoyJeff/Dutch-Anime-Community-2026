import { ImageResponse } from 'next/og';

import { getPageByPath } from '@/lib/site/content';
import { OgCard, ogSize } from '@/lib/site/ogImage';
import { site } from '@/lib/site/site';

// Per-page Open Graph card: routes point openGraph.images at /api/og?path=<path> (see lib/seo →
// ogImageMeta), so a page's share card shows its own title.
export const GET = async (request: Request) => {
	const path = new URL(request.url).searchParams.get('path') ?? '/';
	const page = await getPageByPath(path);

	// The raw query is never drawn into the image, so a crafted ?path= can't inject arbitrary text
	// into a card we serve under our own origin.
	const title = page?.meta.title ?? site.name;
	const description = page?.meta.description ?? site.description;

	return new ImageResponse(<OgCard title={title} description={description} />, ogSize);
};
