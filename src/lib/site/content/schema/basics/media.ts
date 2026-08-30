import { z } from 'zod';

import { Media } from '@/lib/site/content/schema/primitives';

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
		.describe('How wide the image renders, so the browser fetches the smallest fitting variant; a CSS sizes string (\'50vw\') or a mobile-first map (\'{ base: \'100vw\', m: \'50vw\' }\'); defaults to \'auto, 100vw\' (\'100vw\' for the eager leading image)'),
	eager: z.boolean().optional().describe('Loads the image immediately at high priority instead of lazily; set it on the leading image above the fold only; defaults to false'),
	variant: z.enum(['framed', 'plain']).optional().describe('framed (default) renders inside the fixed-ratio frame; plain renders the bare asset at its natural size — logos, wordmarks, mascots (images only)'),
	width: z.number().optional().describe('Intrinsic pixel width for plain images without a manifest entry (prevents layout shift)'),
	height: z.number().optional().describe('Intrinsic pixel height for plain images without a manifest entry'),
	className: z.string().optional().describe('Additional classes on the root element'),
}).meta({ title: 'Media' });
export type MediaProps = z.infer<typeof MediaProps>;
