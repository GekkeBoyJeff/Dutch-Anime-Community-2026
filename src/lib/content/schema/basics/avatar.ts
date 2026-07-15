import { z } from 'zod';

// The serializable half of Avatar's props: the image/status/fallback values that drive its render.
// The ref stays TS-only on the component (see Avatar.tsx).
export const AvatarProps = z
	.object({
		src: z.string().optional().describe('Image URL; when absent the \'initials\' fallback shows'),
		alt: z.string().optional().describe('Accessible alt text for the image'),
		size: z.enum(['s', 'm', 'l']).optional().describe('Size preset; defaults to \'m\''),
		status: z.enum(['online', 'offline', 'busy']).optional().describe('Presence dot'),
		initials: z.string().optional().describe('Fallback initials shown when there is no image'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'Avatar' });
export type AvatarProps = z.infer<typeof AvatarProps>;
