import { z } from 'zod';

// The strict CSP has no 'unsafe-eval', so Zod v4's JIT probe (`new Function`) is reported as a
// securitypolicyviolation — even though Zod swallows the throw and falls back. `jitless` skips the
// probe entirely: no console CSP error, validation stays correct (non-JIT path). Set here because
// this module is the foundation every schema imports, so it runs before any runtime parse.
z.config({ jitless: true });

export const Colorset = z.enum(['light', 'dark']).meta({ title: 'Colorset' }).describe('Light/dark theme applied to the surrounding section');
export type Colorset = z.infer<typeof Colorset>;

export const Id = z.union([z.string(), z.number()]).meta({ title: 'Id' });
export type Id = z.infer<typeof Id>;

export const MediaProvider = z.enum(['youtube', 'vimeo', 'tiktok', 'wistia']).meta({ title: 'MediaProvider' });
export type MediaProvider = z.infer<typeof MediaProvider>;

// Unrefined base shape: zod 4 forbids .pick()/.partial()/.omit() on refined objects, so derived
// schemas (GalleryItem, ImageList mediaOptions) must compose from this instead of `Media`.
export const MediaShape = z.object({
	type: z.enum(['image', 'video', 'embed']).optional().describe('The kind of media: image, video, or embed'),
	src: z.string().optional().describe('Source URL of the image or video').meta({ editor: 'file' }),
	provider: MediaProvider.optional().describe('The embed provider'),
	embedId: z.string().optional().describe('The provider-specific embed id'),
	alt: z.string().optional().describe('Accessible alt text for the media'),
	ratio: z.string().optional().describe('Aspect ratio applied to the media, e.g. \'16:9\''),
	mode: z.enum(['fill', 'fit']).optional().describe('How the asset sits in its box: fill = cover (crop), fit = contain (letterbox); defaults to \'fill\''),
	caption: z.string().optional().describe('Caption text shown below the media'),
	credit: z.string().optional().describe('Attribution / credit text for the media'),
});

export const Media = MediaShape
	.refine((m) => m.type !== 'embed' || (!!m.provider && !!m.embedId), {
		message: 'An embed requires both a provider and an embedId',
		path: ['embedId'],
	})
	// Anything that isn't an embed needs a src to render — including media with no explicit `type`,
	// which Media.tsx defaults to 'image'. Without covering the absent-type case a caption-only object
	// validates green yet renders an empty frame.
	.refine((m) => m.type === 'embed' || !!m.src, {
		message: 'Media requires a src unless it is an embed',
		path: ['src'],
	})
	.meta({ title: 'Media' });
export type Media = z.infer<typeof Media>;

// A bespoke Open Graph image. `url` may be root-relative (resolved against metadataBase), so it is a
// plain string — NOT z.string().url() — but it must be non-empty.
export const OgImage = z
	.object({
		url: z.string().min(1).describe('Absolute or root-relative URL of the Open Graph image').meta({ editor: 'file' }),
		alt: z.string().optional().describe('Accessible alt text for the Open Graph image'),
		width: z.number().optional().describe('Pixel width of the image'),
		height: z.number().optional().describe('Pixel height of the image'),
	})
	.meta({ title: 'OgImage' });
export type OgImage = z.infer<typeof OgImage>;

export const SocialLink = z
	.object({
		label: z.string().min(1).describe('The platform name; the visible link text, or the accessible name when an icon replaces it'),
		url: z.string().min(1).describe('The profile destination, opened in a new tab'),
		icon: z.string().optional().describe('Icon glyph name rendered in place of the visible label').meta({ editor: 'icon' }),
	})
	.meta({ title: 'SocialLink' });
export type SocialLink = z.infer<typeof SocialLink>;

export const Option = z
	.object({
		value: z.string().min(1).describe('The option\'s value'),
		label: z.string().optional().describe('Visible label'),
		disabled: z.boolean().optional().describe('Renders the option but blocks selection'),
	})
	.meta({ title: 'Option' });
export type Option = z.infer<typeof Option>;

export const Heading = z
	.object({
		title: z.string().min(1).describe('The heading text'),
		size: z
			.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5), z.literal(6)])
			.optional()
			.describe('Visual size role of the heading, decoupled from semantic heading level'),
		tagline: z.string().optional().describe('Small text shown above the heading'),
		intro: z.string().optional().describe('Supporting paragraph shown below the heading').meta({ editor: 'textarea' }),
	})
	.meta({ title: 'Heading' });
export type Heading = z.infer<typeof Heading>;

export const StatusVariant = z.enum(['neutral', 'primary', 'info', 'success', 'warning', 'error']).meta({ title: 'StatusVariant' });
export type StatusVariant = z.infer<typeof StatusVariant>;

export const FilterOption = z
	.object({
		label: z.string().min(1).describe('The filter chip\'s visible label'),
		value: z.string().min(1).describe('The machine value matched when filtering'),
		count: z.number().optional().describe('Optional count of matching results shown beside the label'),
	})
	.meta({ title: 'FilterOption' });
export type FilterOption = z.infer<typeof FilterOption>;

export const SortOption = z
	.object({
		label: z.string().min(1).describe('The sort option\'s visible label'),
		value: z.enum(['recent', 'oldest', 'title']).describe('Sort key: newest first, oldest first, or alphabetical by title'),
	})
	.meta({ title: 'SortOption' });
export type SortOption = z.infer<typeof SortOption>;
