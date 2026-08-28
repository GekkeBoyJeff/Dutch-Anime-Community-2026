import { ImageResponse } from 'next/og';

import { OgCard, ogSize, ogContentType } from '@/lib/site/ogImage';
import { site } from '@/lib/site/site';

export const dynamic = 'force-static';

export const size = ogSize;
export const contentType = ogContentType;
export const alt = `${site.name} — ${site.description}`;

// The site-wide DEFAULT share image only: page routes point at /api/og (via ogImageMeta), so this
// card is the fallback for routes that generate no image of their own (e.g. the 404).
const Image = () => {
	return new ImageResponse(<OgCard title={site.name} description={site.description} />, ogSize);
};

export default Image;
