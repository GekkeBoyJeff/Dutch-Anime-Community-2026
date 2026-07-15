import breakpoints from '@/styles/breakpoints.json';

import manifest from './manifest.json';

// Breakpoint names available for a per-breakpoint `sizes` map (all of breakpoints.json).
type SizeBreakpoint = keyof typeof breakpoints;

// A `sizes` value: a raw CSS `sizes` string ('50vw'), or a mobile-first map compiled to one.
export type ResponsiveSizes = string | Partial<Record<'base' | SizeBreakpoint, string>>;

// Largest breakpoint first, so the first matching `(min-width: …)` in `sizes` wins.
const SIZES_ORDER: SizeBreakpoint[] = ['3xl', '2xl', 'xl', 'l', 'm', 's'];

// Compiles a `sizes` value to a real HTML `sizes` string. A string passes through unchanged; a map
// becomes mobile-first conditions (largest breakpoint first) with `base` (default '100vw') as the bare
// fallback. Undefined → '100vw' (full viewport — never under-fetches).
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

// One generated webp variant: its width in px and its public URL.
export type ImageVariant = { w: number; url: string };

// A manifest entry: the source's intrinsic size, its content hash (build cache), and its variants
// (ascending width; the largest equals the intrinsic width — variants never upscale).
export type ManifestEntry = { width: number; height: number; hash: string; variants: ImageVariant[] };

// The manifest, keyed by the public URL of the original image (what content authors put in `src`).
export type Manifest = Record<string, ManifestEntry>;

// Looks up the generated variants for an image `src`. Returns undefined for an unoptimised / remote
// src (the caller then renders a plain <img>).
export const getImage = (src: string): ManifestEntry | undefined => {
	return (manifest as unknown as Manifest)[src];
}

// A static export can live under a repo subpath (NEXT_PUBLIC_BASE_PATH, e.g. GitHub Pages), and a plain
// <img src> is NOT rewritten by Next the way next/image and the router are. So root-relative asset URLs
// (the manifest's variants and the original src) must be prefixed at render time. Empty in the default
// server build and in Storybook/dev, so URLs stay at the root there.
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

// Prefixes a root-relative asset URL with the deploy base path; leaves absolute/remote URLs (and
// undefined) untouched.
export const withBasePath = (url: string | undefined): string | undefined => {
	return url && url.startsWith('/') ? `${BASE_PATH}${url}` : url;
}

// Builds a `srcset` string from variants: "url 320w, url 640w, …" (base-path aware).
export const variantsToSrcSet = (variants: ImageVariant[]): string => {
	return variants.map((v) => `${withBasePath(v.url)} ${v.w}w`).join(', ');
}
