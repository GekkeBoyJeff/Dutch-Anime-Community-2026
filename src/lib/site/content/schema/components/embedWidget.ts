import type { ReactNode } from 'react';
import { z } from 'zod';

import { MediaProvider } from '@/lib/site/content/schema/primitives';

export const EmbedWidgetProps = z
	.object({
		provider: MediaProvider.optional().describe('Known provider for an id-based embed; reuses the Media embed source map'),
		embedId: z.string().optional().describe('The provider video/post id (paired with \'provider\')'),
		src: z.string().optional().describe('A full iframe URL for any other provider (used when \'provider\' is omitted)'),
		title: z.string().optional().describe('Accessible title for the iframe / the visible heading above it'),
		ratio: z.string().optional().describe('Aspect ratio of the frame, e.g. \'16 / 9\'; defaults to \'16 / 9\''),
		caption: z.string().optional().describe('A caption shown under the frame'),
		children: z.custom<ReactNode>().optional().describe('Custom frame content, rendered instead of the provider/src embed'),
		iframeLabel: z.string().optional().describe('Fallback accessible title for the raw-\'src\' iframe when no title/caption is given; defaults to \'Embedded media\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'EmbedWidget' });
export type EmbedWidgetProps = z.infer<typeof EmbedWidgetProps>;
