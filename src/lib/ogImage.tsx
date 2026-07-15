import type { ReactNode } from 'react';

import { brand } from '@/lib/site';

// Shared sizing/content-type for every generated Open Graph image. Both opengraph-image routes
// re-export these as their `size`/`contentType` so the dimensions live in one place.
export const ogSize = { width: 1200, height: 630 };
export const ogContentType = 'image/png';

interface OgImageFrameProps {
	/** The per-route text block, drawn below the accent bar */
	children?: ReactNode;
}

interface OgCardProps {
	/** The large headline — a page title, or the site name for the default card */
	title: string;
	/** The supporting line below the title — a page or site description */
	description: string;
}

// The shared Open Graph card: dark canvas + brand accent bar, with the route-specific text passed as
// children. satori (next/og) renders outside the DOM and can't read CSS variables, so colours come
// from the `brand` constant in site.ts rather than the SCSS tokens. Extracted so a tweak to
// padding/background/accent happens once and the site and per-page share images stay in sync.
export const OgImageFrame = ({ children }: OgImageFrameProps) => {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'space-between',
				padding: '80px',
				backgroundColor: brand.ink,
				color: brand.page,
			}}
		>
			<div style={{ display: 'flex', width: '72px', height: '8px', backgroundColor: brand.primary }} />
			{children}
		</div>
	);
};

// The default share-card layout: title over description, inside the shared frame. Both the site-wide
// opengraph-image and the per-page /api/og route render this, so every generated card looks identical
// apart from its text — change the type scale or spacing here and both stay in sync.
export const OgCard = ({ title, description }: OgCardProps) => {
	return (
		<OgImageFrame>
			<div style={{ display: 'flex', flexDirection: 'column' }}>
				<div style={{ fontSize: '76px', fontWeight: 700, lineHeight: 1.05 }}>{title}</div>
				<div style={{ fontSize: '32px', color: brand.subtle, marginTop: '20px' }}>{description}</div>
			</div>
		</OgImageFrame>
	);
};
