import breakpoints from '@/styles/breakpoints.json';

import manifest from './manifest.json';

type SizeBreakpoint = keyof typeof breakpoints;

export type ResponsiveSizes = string | Partial<Record<'base' | SizeBreakpoint, string>>;

// Largest breakpoint first, so the first matching `(min-width: …)` in `sizes` wins.
const SIZES_ORDER: SizeBreakpoint[] = ['3xl', '2xl', 'xl', 'l', 'm', 's'];

export const compileSizes = (sizes?: ResponsiveSizes): string => {
	if (sizes === undefined) return '100vw';
	if (typeof sizes === 'string') return sizes;

	const conditions: string[] = [];
	for (const bp of SIZES_ORDER) {
		const value = sizes[bp];
		if (value) conditions.push(`(min-width: ${breakpoints[bp]}) ${value}`);
	}
	conditions.push(sizes.base ?? '100vw');
	return conditions.join(', ');
}

export type ImageVariant = { w: number; url: string };

export type ManifestEntry = { width: number; height: number; hash: string; variants: ImageVariant[] };

type Manifest = Record<string, ManifestEntry>;

export const getImage = (src: string): ManifestEntry | undefined => {
	return (manifest as unknown as Manifest)[src];
}

// A static export can live under a repo subpath (NEXT_PUBLIC_BASE_PATH, e.g. GitHub Pages), and a plain
// <img src> is NOT rewritten by Next the way next/image and the router are. So root-relative asset URLs
// (the manifest's variants and the original src) must be prefixed at render time.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export const withBasePath = (url: string | undefined): string | undefined => {
	return url && url.startsWith('/') ? `${BASE_PATH}${url}` : url;
}

export const variantsToSrcSet = (variants: ImageVariant[]): string => {
	return variants.map((v) => `${withBasePath(v.url)} ${v.w}w`).join(', ');
}
