import { z } from 'zod';

import { AnnouncementVariant } from '@/lib/content/schema/structures/announcementBar';

// Props for the AnnouncementDismiss component: the interactive wrapper for AnnouncementBar, holding
// the open/leaving state, the close button, and the per-id dismissal persistence.
export const AnnouncementDismissProps = z
	.object({
		variant: AnnouncementVariant.optional().describe('Visual variant; tints the bar via the status tokens; defaults to \'info\''),
		dismissible: z.boolean().optional().describe('Whether the close button is shown; defaults to true'),
		id: z.string().optional().describe('Stable id; remembers the dismissal in localStorage under this key'),
		className: z.string().optional().describe('Additional classes on the root element'),
	})
	.meta({ title: 'AnnouncementDismiss' });
export type AnnouncementDismissProps = z.infer<typeof AnnouncementDismissProps>;
