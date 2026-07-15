import { ImageResponse } from 'next/og';

import { OgCard, ogSize, ogContentType } from '@/lib/ogImage';
import { site } from '@/lib/site';

// Static (no per-request input), so `output: export` renders it once to a file.
export const dynamic = 'force-static';

export const size = ogSize;
export const contentType = ogContentType;
// Emitted as <meta property="og:image:alt"> so the share image has accessible alt text.
export const alt = `${site.name} — ${site.description}`;

// The site-wide DEFAULT share image: the brand card with the site name + description. Page routes
// point at /api/og instead (via ogImageMeta), which renders the same card with the page's own title;
// this file is the fallback for routes that generate no image of their own (e.g. the 404). The per-page
// card is a route handler (/api/og) rather than per-segment opengraph-image files, so one generator
// serves every path and the metadata wiring lives in one place.
const Image = () => {
	return new ImageResponse(<OgCard title={site.name} description={site.description} />, ogSize);
};

export default Image;
