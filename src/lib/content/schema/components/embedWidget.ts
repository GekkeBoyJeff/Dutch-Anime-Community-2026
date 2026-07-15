import { z } from 'zod';

import { MediaProvider } from '@/lib/content/schema/primitives';

// Props for the EmbedWidget component: a self-contained, responsive third-party embed - a provider id
// (reusing Media's embed map) or a raw iframe URL, framed at a fixed aspect ratio with an optional
// heading and caption.
export const EmbedWidgetProps = z
	.object({
		provider: MediaProvider.optional().describe('Known provider for an id-based embed; reuses the Media embed source map'),
		embedId: z.string().optional().describe('The provider video/post id (paired with \'provider\')'),
		src: z.string().optional().describe('A full iframe URL for any other provider (used when \'provider\' is omitted)'),
		title: z.string().optional().describe('Accessible title for the iframe / the visible heading above it'),
		ratio: z.string().optional().describe('Aspect ratio of the frame, e.g. \'16 / 9\'; defaults to \'16 / 9\''),
		caption: z.string().optional().describe('A caption shown under the frame'),
		iframeLabel: z.string().optional().describe('Fallback accessible title for the raw-\'src\' iframe when no title/caption is given; defaults to \'Embedded media\''),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'EmbedWidget' });
export type EmbedWidgetProps = z.infer<typeof EmbedWidgetProps>;
