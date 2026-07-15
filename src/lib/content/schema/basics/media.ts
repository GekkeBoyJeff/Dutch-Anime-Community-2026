import { z } from 'zod';

import { Media } from '@/lib/content/schema/primitives';

// The Media content shape (from the primitive — including `mode`) plus the presentation props
// (sizes, className) that aren't content. `sizes` mirrors ResponsiveSizes: a raw CSS sizes string,
// or a mobile-first map keyed by breakpoint (all optional, so a caller overrides what it needs).
export const MediaProps = Media.extend({
	sizes: z
		.union([
			z.string(),
			z.object({
				base: z.string().optional(),
				s: z.string().optional(),
				m: z.string().optional(),
				l: z.string().optional(),
				xl: z.string().optional(),
				'2xl': z.string().optional(),
				'3xl': z.string().optional(),
			}),
		])
		.optional()
		.describe('How wide the image renders, so the browser fetches the smallest fitting variant; a CSS sizes string (\'50vw\') or a mobile-first map (\'{ base: \'100vw\', m: \'50vw\' }\'); defaults to \'100vw\''),
	variant: z.enum(['framed', 'plain']).optional().describe('framed (default) renders inside the fixed-ratio frame; plain renders the bare asset at its natural size — logos, wordmarks, mascots (images only)'),
	width: z.number().optional().describe('Intrinsic pixel width for plain images without a manifest entry (prevents layout shift)'),
	height: z.number().optional().describe('Intrinsic pixel height for plain images without a manifest entry'),
	className: z.string().optional().describe('Additional classes on the root element'),
}).meta({ title: 'Media' });
export type MediaProps = z.infer<typeof MediaProps>;
