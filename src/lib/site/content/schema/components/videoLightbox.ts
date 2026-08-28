import { z } from 'zod';

import { MediaProvider } from '@/lib/site/content/schema/primitives';

export const VideoLightboxProps = z
	.object({
		open: z.boolean().describe('Whether the lightbox is open'),
		onClose: z.custom<() => void>().describe('Fires when the lightbox asks to close (Escape, backdrop, close button)'),
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
