import { z } from 'zod';

import { MediaProvider } from '@/lib/content/schema/primitives';

// Props for the VideoLightbox component: a fullscreen media overlay for an embed or native video,
// routed through the shared Media primitive (embed vs video), with the player kept mounted until
// the close transition ends.
export const VideoLightboxProps = z
	.object({
		open: z.boolean().describe('Whether the lightbox is open'),
		provider: MediaProvider.optional().describe('Embed provider; omit for native \'src\' video'),
		embedId: z.string().optional().describe('The provider\'s video id (required for an embed)'),
		src: z.string().optional().describe('A direct video URL for native playback (when there is no provider)'),
		poster: z.string().optional().describe('Poster frame for the native video'),
		title: z.string().optional().describe('Accessible title for the dialog and media'),
		closeLabel: z.string().optional().describe('Accessible label for the close button; defaults to \'Close\''),
		className: z.string().optional().describe('Additional classes on the popup'),
	})
	.meta({ title: 'VideoLightbox' });
export type VideoLightboxProps = z.infer<typeof VideoLightboxProps>;
